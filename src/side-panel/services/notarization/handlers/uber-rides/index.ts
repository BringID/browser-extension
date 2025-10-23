import { NotarizationBase } from '../../notarization-base';
import { RequestRecorder } from '../../../requests-recorder';
import { Request } from '../../../../common/types';
import { TLSNotary } from '../../../tlsn';
import { Commit } from 'bringid-tlsn-js'
import { Mapping, parse, Pointers } from 'json-source-map';
import TActivitiesResponse from './types';

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


    const query =  '{ currentUser { uuid } activities { past(limit: 10) { activities { uuid, description } } } }'

    const requestParams = {
      method: log[0].method,
      headers: {
        'content-type': 'application/json',
        'x-csrf-token': 'x',
        Cookie: [...log[0].headers['Cookie'].matchAll(/(sid|csid)=([^;]*)/g)]
          .map((res) => res[0])
          .join(';'),
      },
      body: JSON.stringify({
        query
      }),
    };

    try {
      // initial check
      const response = await fetch(log[0].url, requestParams);

      const responseJSON = (await response.json()) as TActivitiesResponse;

      const {
        data: {
          currentUser,
          activities: {
            past: { activities: activitiesCheck },
          },
        },
      } = responseJSON;

      if (!currentUser.uuid || !activitiesCheck) {
        this.result(new Error('required_data_not_found'));
      }

      const activitiesNotCanceled = activitiesCheck.filter((activity) => {
        return activity.description.indexOf('Canceled') === -1;
      });

      if (activitiesNotCanceled.length < 5) {
        this.result(new Error('not_enough_rides'));
        return;
      }
    } catch (err) {
      console.error(err);
    }

    try {
      const notary = await TLSNotary.new(
        {
          serverDns: 'riders.uber.com',
          maxSentData: 704,
          maxRecvData: 5000,
        },
        {
          logEveryNMessages: 100,
          verbose: true,
          logPrefix: '[WS Monitor / X-Uber]',
          trackSize: true,
          expectedTotalBytes: 55000000 * 1.15,
          enableProgress: true,
          progressUpdateInterval: 500,
        },
      );

      const result = await notary.transcript({
        url: log[0].url,
        ...requestParams,
        body: {
          query
        },
      });

      if (result instanceof Error) {
        this.result(result);
        return;
      }
      const [transcript, message] = result;

      // keep only HTTP method and URL and hide everything after in the response
      const sentEnd = `${log[0].method} ${log[0].url}`.length;

      const commit: Commit = {
        sent: [{ start: 0, end: sentEnd }],
        recv: [],
      };

      const transcriptJsonStr = Buffer.from(transcript.recv).toString('utf-8');

      const jsonStarts: number = transcriptJsonStr.indexOf('\n{') + 1;

      const pointers: Pointers = parse(message.body.toString()).pointers;

      const uuid: Mapping = pointers['/data/currentUser/uuid'];
      const activities: Mapping = pointers['/data/activities/past/activities'];

      // can be deleted
      if (!activities.key?.pos || !uuid.key?.pos) {
        this.result(new Error('required_data_not_found'));
        return;
      }

      // We need it to properly process UTF-8 symbols in Verifier.
      const dataLength = Buffer.from(
        message.body
          .toString()
          .substring(activities.key?.pos, activities.valueEnd.pos),
        'utf-8',
      ).length;

      commit.recv = [
        {
          start: jsonStarts + uuid.key?.pos,
          end: jsonStarts + uuid.valueEnd.pos,
        },
        {
          start: jsonStarts + activities.key?.pos,
          end: jsonStarts + activities.key?.pos + dataLength,
        },
      ];

      const jsonTranscript: [{ description: string; uuid: string }] =
        JSON.parse(
          transcriptJsonStr.slice(
            jsonStarts + activities.value.pos,
            jsonStarts + activities.valueEnd.pos,
          ),
        );

      const validRidesCount = jsonTranscript.filter(
        (item) => item.description.indexOf('Canceled') === -1,
      ).length;

      // can be deleted
      if (validRidesCount < 5) {
        this.result(new Error('not_enough_rides'));
        return;
      }

      this.result(await notary.notarize(commit));
    } catch (err) {
      this.result(err as Error);
    }
  }

  public async onStop(): Promise<void> {
    this.requestRecorder.stop();
  }
}
