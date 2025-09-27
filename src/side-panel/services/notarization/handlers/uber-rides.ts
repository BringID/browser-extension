import { NotarizationBase } from '../notarization-base';
import { RequestRecorder } from '../../requests-recorder';
import { Request } from '../../../common/types';
import { TLSNotary } from '../../tlsn';
import { Commit } from 'tlsn-js';
import { Mapping, parse, Pointers } from 'json-source-map';

export class NotarizationUberRides extends NotarizationBase {
  requestRecorder: RequestRecorder = new RequestRecorder(
    [
      {
        method: 'POST',
        urlPattern: 'https://riders.uber.com/graphql',
      },
    ],
    this.onRequestsCaptured.bind(this),
  );

  public async onStart(): Promise<void> {
    this.requestRecorder.start();
    await chrome.tabs.create({ url: 'https://riders.uber.com/trips' });
    this.currentStep = 1;
    if (this.currentStepUpdateCallback)
      this.currentStepUpdateCallback(this.currentStep);
  }

  private async onRequestsCaptured(log: Array<Request>) {
    this.currentStep = 2;
    if (this.currentStepUpdateCallback)
      this.currentStepUpdateCallback(this.currentStep);
    try {
      const notary = await TLSNotary.new('riders.uber.com');
      this.setProgress(33);
      const result = await notary.transcript({
        url: log[0].url,
        method: log[0].method,
        headers: {
          'content-type': 'application/json',
          'x-csrf-token': 'x',
          Cookie: [...log[0].headers['Cookie'].matchAll(/(sid|csid)=([^;]*)/g)]
            .map((res) => res[0])
            .join(';'),
        },
        body: {
          query:
            '{ currentUser { uuid } activities { past(limit: 1) { activities { uuid } } } }',
        },
      });
      if (result instanceof Error) {
        this.result(result);
        return;
      }
      const [transcript, message] = result;

      const commit: Commit = {
        sent: [{ start: 0, end: transcript.sent.length }],
        recv: [],
      };
      this.setProgress(66);
      console.log(
        'Transcript: ',
        Buffer.from(transcript.recv).toString('utf-8'),
      );
      const jsonStarts: number =
        Buffer.from(transcript.recv).toString('utf-8').indexOf('\n{') + 1;

      const pointers: Pointers = parse(message.body.toString()).pointers;

      const uuid: Mapping = pointers['/data/currentUser/uuid'];
      const activities: Mapping = pointers['/data/activities/past/activities'];

      if (!activities.key?.pos || !uuid.key?.pos) {
        this.result(new Error('required data not found'));
        return;
      }

      commit.recv = [
        {
          start: jsonStarts + uuid.key?.pos,
          end: jsonStarts + uuid.valueEnd.pos,
        },
        {
          start: jsonStarts + activities.key?.pos,
          end: jsonStarts + activities.valueEnd.pos,
        },
      ];

      this.setProgress(99);

      this.result(await notary.notarize(commit));
    } catch (err) {
      this.result(err as Error);
    }
  }

  public async onStop(): Promise<void> {
    this.requestRecorder.stop();
  }
}
