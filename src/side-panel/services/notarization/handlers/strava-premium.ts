import { NotarizationBase } from '../notarization-base';
import { RequestRecorder } from '../../requests-recorder';
import { Request } from '../../../common/types';
import { TLSNotary } from '../../tlsn';
import { Commit } from 'tlsn-js';

export class NotarizationStravaPremium extends NotarizationBase {
  requestRecorder: RequestRecorder = new RequestRecorder(
    [
      {
        method: 'GET',
        urlPattern: 'https://www.strava.com/frontend/athletes/current',
      },
    ],
    this.onRequestsCaptured.bind(this),
  );

  public async onStart(): Promise<void> {
    this.requestRecorder.start();
    await chrome.tabs.create({ url: 'https://www.strava.com/dashboard' });
    this.setProgress(30);
  }

  private async onRequestsCaptured(log: Array<Request>) {
    this.setProgress(60);
    const notary = await TLSNotary.new('strava.com');

    const reqLog = log[0];
    reqLog.headers = { ...log[0].headers };
    delete reqLog.headers['Accept-Encoding'];
    const result = await notary.transcript(log[0]);
    if (result instanceof Error) {
      this.result(result);
      return;
    }
    const [transcript] = result;

    const responseBody = String.fromCharCode(...transcript.recv);

    const isSubscriber = responseBody.match(/"is_subscriber":true/);

    console.log({ responseBody, isSubscriber });

    const commit: Commit = {
      sent: [{ start: 0, end: transcript.sent.length }],
      recv: [],
    };

    if (isSubscriber && isSubscriber.index !== undefined) {
      const start = isSubscriber.index;
      if (start >= 0) {
        commit.recv.push({
          start: start,
          end: start + isSubscriber[0].length,
        });
      }
    }

    this.result(await notary.notarize(commit));
  }

  public async onStop(): Promise<void> {
    this.requestRecorder.stop();
  }
}
