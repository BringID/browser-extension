import {
    RequestBodyHandlerData,
    RequestHeadersHandlerData,
    PartialRequestLog,
    RequestLog,
    TargetRequest,
    UrlPattern
} from "./types";
import {toCompleteLog, toHttpMethod} from "./type-guards";

type SuccessCallback = (log: Array<RequestLog>) => void;

export class RequestRecorder {
    readonly #successCallback: SuccessCallback;
    readonly #targetRequests: TargetRequest[] = [];
    #completeCounter: number = 0;
    #requestsLog: Array<PartialRequestLog | undefined> = [];
    #completedRequestsLog: Array<RequestLog> = [];
    #recording: boolean = false;

    public get completedRequestsLog(): Array<RequestLog> { return this.#completedRequestsLog; }
    public get recording(): boolean { return this.#recording; }

    constructor(targetRequests: TargetRequest[], successCallback: SuccessCallback) {
        this.#targetRequests = targetRequests;
        this.#successCallback = successCallback;
    }

    start(): void {
        this.#completedRequestsLog = new Array<RequestLog>(this.#targetRequests.length);
        this.#requestsLog = new Array<PartialRequestLog | undefined>(this.#targetRequests.length).fill(undefined);
        this.#recording = true;

        const urls: UrlPattern[] = this.#targetRequests.map((tr: TargetRequest) => tr.urlPattern);
        chrome.webRequest.onBeforeRequest.addListener(this.handleRequestBody, {urls}, ["requestBody"]);
        chrome.webRequest.onSendHeaders.addListener(this.handleRequestHeaders, {urls}, ["requestHeaders"]);
    }

    stop(): void {
        this.#recording = false;
        chrome.webRequest.onBeforeRequest.removeListener(this.handleRequestBody);
        chrome.webRequest.onSendHeaders.removeListener(this.handleRequestHeaders);
    }

    private requestId(method: string, url: string): number {
        method = method.toUpperCase();
        if(!toHttpMethod(method)) return -1;
        return this.#targetRequests
            .findIndex(tr => {
                if (tr.method !== method) return false;
                const regex = tr.urlPattern
                    .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // escape regex-symbols
                    .replace(/\*/g, '.*');
                return new RegExp(`^${regex}$`).test(url);
            });
    }

    private completeRequestLog(requestId: number, existingLog: PartialRequestLog): void {
        if (toCompleteLog(existingLog)) {
            this.#completeCounter++;
            const completeLog: RequestLog = existingLog;
            this.#completedRequestsLog[requestId] = completeLog;
            delete this.#requestsLog[requestId];
            if(this.#completeCounter === this.#targetRequests.length) {
                this.stop();
                void this.#successCallback(this.#completedRequestsLog);
            }
        }
    }

    private updateRequestLog(requestId: number, updates: RequestBodyHandlerData | RequestHeadersHandlerData): void {
        if (requestId < 0 || requestId >= this.#targetRequests.length) return;
        const existingLog: PartialRequestLog | undefined = this.#requestsLog[requestId];

        if (existingLog && existingLog.requestId === updates.requestId) {
            // Partial log exists - was created by one of the handlers and has the same requestId
            // Update existing partial log
            Object.assign<PartialRequestLog, RequestBodyHandlerData | RequestHeadersHandlerData>(existingLog, updates);
            this.completeRequestLog(requestId, existingLog);
        } else if (!existingLog && this.#completedRequestsLog[requestId] === undefined) {
            // Partial log doesn't exist and was not already completed
            // Create new partial log
            this.#requestsLog[requestId] = updates;
        }
    }

    // Note: keep arrow function for a proper scope management
    private handleRequestBody = (details: chrome.webRequest.WebRequestBodyDetails): void => {
        const requestId = this.requestId(details.method, details.url)
        if (!this.#recording) return;

        this.updateRequestLog(requestId, {
            requestId: details.requestId,
            url: details.url,
            method: details.method,
            query: Object.fromEntries(new URL(details.url).searchParams),
            body: details.requestBody,
            timestamp: Date.now(),
        } satisfies RequestBodyHandlerData);
    };

    // Note: keep arrow function for a proper scope management
    private handleRequestHeaders = (details: chrome.webRequest.WebRequestHeadersDetails): void => {
        const requestId = this.requestId(details.method, details.url)
        if (!this.#recording) return;

        this.updateRequestLog(requestId, {
            requestId: details.requestId,
            headers: this.parseHeaders(details.requestHeaders || []),
            cookies: this.parseCookiesFromHeaders(details.requestHeaders || [])
        } satisfies RequestHeadersHandlerData);
    };

    private parseHeaders(headers: chrome.webRequest.HttpHeader[]): Record<string, string> {
        return headers.reduce((acc, header) => {
            if (header.name && header.value) {
                acc[header.name] = header.value;
            }
            return acc;
        }, {} as Record<string, string>);
    }

    private parseCookiesFromHeaders(headers: chrome.webRequest.HttpHeader[]): Record<string, string> {
        const cookieHeader = headers.find(h => h.name?.toLowerCase() === 'cookie');
        if (!cookieHeader?.value) return {};

        // TODO Use URL
        return cookieHeader.value.split(';').reduce((acc, cookie) => {
            const trimmed = cookie.trim()
            const separatorIndex = trimmed.indexOf('=')
            const [name, value] = [
                trimmed.substring(0, separatorIndex),
                trimmed.substring(separatorIndex + 1)
            ]
            if (name && value) {
                acc[name] = value;
            }
            return acc;
        }, {} as Record<string, string>);
    }
}