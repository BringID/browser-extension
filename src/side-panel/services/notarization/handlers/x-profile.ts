import { NotarizationBase } from '../notarization-base';
import { RequestRecorder } from '../../requests-recorder';
import { Request } from '../../../common/types';
import { TLSNotary } from '../../tlsn';
import { Commit } from 'tlsn-js';

export class NotarizationXProfile extends NotarizationBase {
  requestRecorder: RequestRecorder = new RequestRecorder(
    [
      {
        method: 'GET',
        urlPattern: 'https://api.x.com/1.1/account/settings.json?*',
      },
    ],
    this.onRequestsCaptured.bind(this),
  );

  public async onStart(): Promise<void> {
    this.requestRecorder.start();
    await chrome.tabs.create({ url: 'https://x.com' });
    this.setProgress(30);
  }

  private async onRequestsCaptured(log: Array<Request>) {
    this.setProgress(60);
    const notary = await TLSNotary.new('api.x.com');
    console.log('LOG:', log[0]);
    const result = await notary.transcript(log[0]);
    if (result instanceof Error) {
      this.result(result);
      return;
    }
    const [transcript] = result;
    const commit: Commit = {
      sent: [{ start: 0, end: transcript.sent.length }],
      recv: [{ start: 0, end: Math.floor(transcript.recv.length / 2) }],
    };

    this.result(await notary.notarize(commit));
  }

  public async onStop(): Promise<void> {
    this.requestRecorder.stop();
  }
}
