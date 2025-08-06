import {NotarizationBase} from "../notarization-base";
import {RequestRecorder} from "../../requests-recorder";
import {RequestLog} from "../../requests-recorder/types";

export class NotarizationUberRides extends NotarizationBase {
    requestRecorder: RequestRecorder = new RequestRecorder(
        [{method: "GET", urlPattern: "https://api.x.com/1.1/account/settings.json"}],
        this.onRequestsCaptured.bind(this)
    );

    public async onStart(): Promise<void> {
        await chrome.tabs.create({url: "https://x.com"})
        this.setProgress(30);
        this.requestRecorder.start();
    };

    private async onRequestsCaptured(log: Array<RequestLog>) {
        this.setProgress(60);
        console.log(log);
        this.result(new Error("Notarization is not implemented"))
    }

    public async onStop(): Promise<void> {
        this.requestRecorder.stop();
    };
}