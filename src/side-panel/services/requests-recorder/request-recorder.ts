import {
    PartialRequestLog,
    RequestBodyHandlerData,
    RequestHeadersHandlerData,
    Status,
    TargetRequest,
    UrlPattern
} from "./types";
import {toCompleteLog} from "./guards";
import {toHttpMethod} from "../../common/guards";
import {Result} from "../../../common/types";
import {Request} from "../../common/types";
import {toRequest} from "./helpers";
import {Progressive, State} from "../../common/helpers/progressive";

type SuccessCallback = (log: Array<Request>) => void;

export class RequestRecorder extends Progressive<Status>{
    readonly #successCallback: SuccessCallback;
    readonly #targetRequests: TargetRequest[] = [];
    #completeCounter: number = 0;
    #requestsLog: Array<PartialRequestLog | undefined> = [];
    #completedRequestsLog: Array<Request> = [];

    public get completedRequestsLog(): Array<Request> { return this.#completedRequestsLog; }

    constructor(
        targetRequests: TargetRequest[],
        successCallback: SuccessCallback,
        onStateUpdated?: (state: State<Status>) => void,
    ) {
        super({ progress: 0, status: Status.Idle }, onStateUpdated);
        this.#targetRequests = targetRequests;
        this.#successCallback = successCallback;
    }

    start(): void {
        if (this.state.status === Status.Recording) return;
        this.#completedRequestsLog = new Array<Request>(this.#targetRequests.length);
        this.#requestsLog = new Array<PartialRequestLog | undefined>(this.#targetRequests.length).fill(undefined);

        const urls: UrlPattern[] = this.#targetRequests.map((tr: TargetRequest) => tr.urlPattern);
        chrome.webRequest.onBeforeRequest.addListener(this.handleRequestBody, {urls}, ["requestBody"]);
        chrome.webRequest.onSendHeaders.addListener(this.handleRequestHeaders, {urls}, ["requestHeaders", "extraHeaders"]);
        this.setStatus(Status.Recording);
    }

    stop(): void {
        this.setStatus(Status.Stopped);
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
            const requestRes = toRequest(existingLog)
            if(requestRes instanceof Error) {
                this.stop()
                this.setError(new Error(`Failed to convert request log to Request object: ${requestRes.message}`))
                return;
            }
            this.#completedRequestsLog[requestId] = requestRes;
            delete this.#requestsLog[requestId];
            if(this.#completeCounter === this.#targetRequests.length) {
                this.stop();
                void this.#successCallback(this.#completedRequestsLog);
            }
        }
    }

    private updateRequestLog(requestId: number, updates: RequestBodyHandlerData | RequestHeadersHandlerData): Result<void> {
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
        if (this.state.status !== Status.Recording) return;

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
        if (this.state.status !== Status.Recording) return;

        this.updateRequestLog(requestId, {
            requestId: details.requestId,
            headers: this.parseHeaders(details.requestHeaders || [])
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
}