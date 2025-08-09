import {NotarizationBase} from "../notarization-base";
import {RequestRecorder} from "../../requests-recorder";
import {Request} from "../../../common/types";
import {TLSNotary} from "../../tlsn";

export class NotarizationUberRides extends NotarizationBase {
    requestRecorder: RequestRecorder = new RequestRecorder(
        [{method: "GET", urlPattern: "https://api.x.com/1.1/account/settings.json?*"}],
        this.onRequestsCaptured.bind(this)
    );

    public async onStart(): Promise<void> {
        this.requestRecorder.start();
        await chrome.tabs.create({url: "https://x.com"})
        this.setProgress(30);
    };

    private async onRequestsCaptured(log: Array<Request>) {
        this.setProgress(60);
        console.log(log);
        this.result(new Error("Notarization is not implemented"));

        const notary = await TLSNotary.new("x.com");
        const result = await notary.transcript({
            url: log[0].url,
            method: log[0].method,
            headers: log[0].headers,
            body: log[0].body
        })
        if(result instanceof Error) {
            this.result(result);
            return;
        }
        const [, message] = result;
        console.log(message);
    }

    public async onStop(): Promise<void> {
        this.requestRecorder.stop();
    };
}