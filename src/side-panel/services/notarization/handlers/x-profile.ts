import { NotarizationBase } from '../notarization-base';
import { RequestRecorder } from '../../requests-recorder';
import { Request } from '../../../common/types';
import { TLSNotary } from '../../tlsn';
import { Commit } from 'tlsn-js';
import { parse, Pointers, Mapping } from 'json-source-map';

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

    // check if on login page => this.setMessage('...')
    this.currentStep = 1;
    if (this.currentStepUpdateCallback)
      this.currentStepUpdateCallback(this.currentStep);
  }

  private async onRequestsCaptured(log: Array<Request>) {
    this.currentStep = 2;
    if (this.currentStepUpdateCallback)
      this.currentStepUpdateCallback(this.currentStep);

    try {
      const notary = await TLSNotary.new('api.x.com');
      this.setProgress(33);
      delete log[0].headers['Accept-Encoding'];
      const result = await notary.transcript(log[0]);
      if (result instanceof Error) {
        this.result(result);
        return;
      }
      const [transcript, message] = result;

      const commit: Commit = {
        sent: [{ start: 0, end: transcript.sent.length }],
        recv: [{ start: 0, end: message.info.length }],
      };
      this.setProgress(66);
      const jsonStarts: number = Buffer.from(transcript.recv)
        .toString('utf-8')
        .indexOf('{');

      const pointers: Pointers = parse(message.body.toString()).pointers;

      const screenName: Mapping = pointers['/screen_name'];
      console.log({ pointers });
      if (!screenName.key?.pos) {
        this.result(new Error('screen_name not found'));
        return;
      }
      commit.recv.push({
        start: jsonStarts + screenName.key?.pos,
        end: jsonStarts + screenName.valueEnd.pos,
      });
      console.log({ commit });

      this.setProgress(99);

      this.result(await notary.notarize(commit));
    } catch (err) {
      this.result(err as Error)
    }
  }

  public async onStop(): Promise<void> {
    this.requestRecorder.stop();
  }
}
