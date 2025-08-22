import {NotarizationBase} from "../notarization-base";
import {RequestRecorder} from "../../requests-recorder";
import {Request} from "../../../common/types";
import {TLSNotary} from "../../tlsn";
import {Commit} from "tlsn-js";

export class NotarizationAppleDevices extends NotarizationBase {
    requestRecorder: RequestRecorder = new RequestRecorder(
        [
            {method: "GET", urlPattern: "https://appleid.apple.com/account/manage/security/devices"}
        ],
        this.onRequestsCaptured.bind(this)
    );

    public async onStart(): Promise<void> {
        this.requestRecorder.start();
        await chrome.tabs.create({url: "https://account.apple.com/account/manage/section/devices"})
        this.setProgress(30);
    };

    private async onRequestsCaptured(log: Array<Request>) {
        this.setProgress(60);
        console.log("[AppleDevices] Starting request processing...");
        console.log("[AppleDevices] Original request log:", log);
        
        const reqLog = log[0];
        // Create a deep copy of headers to avoid modifying original
        reqLog.headers = { ...log[0].headers };
        
        console.log("[AppleDevices] Original headers count:", Object.keys(reqLog.headers).length);
        console.log("[AppleDevices] Original headers:", Object.keys(reqLog.headers));
        
        reqLog.headers["Accept-Encoding"] = "identity";
        reqLog.headers["Connection"] = "close";
        
        const headersToRemove = [
            "cookie",
            "scnt",
            "x-apple-api-key",
            "x-apple-i-request-context",
            "origin",
            "referer",
            
            "user-agent",
            "accept",
            
            "Accept-Language",
            "Content-Type", 
            "X-Apple-I-TimeZone",
            "Sec-Fetch-Dest",
            "Sec-Fetch-Mode", 
            "Sec-Fetch-Site",
            "sec-ch-ua",
            "sec-ch-ua-mobile",
            "sec-ch-ua-platform",
            "X-Apple-I-FD-Client-Info"
        ];
        
        headersToRemove.forEach(header => {
            if (reqLog.headers[header]) {
                delete reqLog.headers[header];
                console.log(`[AppleDevices] Removed header: ${header}`);
            }
        });

        console.log("[AppleDevices] Cleaned headers count:", Object.keys(reqLog.headers).length);
        console.log("[AppleDevices] Cleaned headers:", Object.keys(reqLog.headers));
        console.log("[AppleDevices] Cleaned request headers:", reqLog.headers);

        const notary = await TLSNotary.new("account.apple.com");
        console.log("[AppleDevices] TLSNotary instance created");
        
        const result = await notary.transcript(reqLog);
        console.log("[AppleDevices] Transcript result:", result);

        if(result instanceof Error) {
            console.error("[AppleDevices] Error in transcript:", result);
            this.result(result);
            return;
        }
        const [transcript, message] = result;
        console.log("[AppleDevices] Transcript length:", transcript.recv.length);
        console.log("[AppleDevices] Message body length:", message.body.length);

        const commit: Commit = {
            sent: [{ start: 0, end: transcript.sent.length }],
            recv: []
        };

        // Find JSON start position in the response
        const responseText = Buffer.from(transcript.recv).toString('utf-8');
        const jsonStarts: number = responseText.indexOf('{');
        console.log("[AppleDevices] Response text preview:", responseText.substring(0, 200));
        console.log("[AppleDevices] JSON starts at position:", jsonStarts);

        try {
            // Parse JSON response and extract first device ID
            const messageBodyStr = message.body.toString();
            console.log("[AppleDevices] Message body preview:", messageBodyStr.substring(0, 300));
            
            const jsonData = JSON.parse(messageBodyStr);
            if (jsonData.devices && Array.isArray(jsonData.devices) && jsonData.devices.length > 0) {
                const firstDeviceId = jsonData.devices[0].id;
                if (firstDeviceId) {
                    console.log("[AppleDevices] Found first device ID:", firstDeviceId);
                    
                    const responseText = Buffer.from(transcript.recv).toString('utf-8');
                    const idStart = responseText.indexOf(`"id" : "${firstDeviceId}"`);
                    const idEnd = idStart + `"id" : "${firstDeviceId}"`.length;
                    
                    if (idStart !== -1) {
                        console.log("[AppleDevices] Found device ID position:", idStart, idEnd);
                        
                        const deviceIdCommitRange = {
                            start: idStart,
                            end: idEnd
                        };
                        commit.recv.push(deviceIdCommitRange);
                        
                        console.log("[AppleDevices] Added device ID to commit range:", deviceIdCommitRange);
                    }
                }
            }

        } catch (error) {
            console.error("[AppleDevices] Error parsing JSON:", error);
        }

        console.log("[AppleDevices] Starting notarization...");
        const notarizationResult = await notary.notarize(commit);
        console.log("[AppleDevices] Notarization completed:", notarizationResult);
        this.result(notarizationResult);
    }

    public async onStop(): Promise<void> {
        this.requestRecorder.stop();
    };
}