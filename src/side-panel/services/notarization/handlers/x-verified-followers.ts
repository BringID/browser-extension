import { NotarizationBase } from '../notarization-base';
import { RequestRecorder } from '../../requests-recorder';
import { Request } from '../../../common/types';
import { TLSNotary } from '../../tlsn';
import { Commit } from 'tlsn-js';

export class NotarizationXVerifiedFollowers extends NotarizationBase {
  requestRecorder: RequestRecorder = new RequestRecorder(
    [
      {
        method: 'GET',
        urlPattern:
          'https://x.com/i/api/graphql/LwtiA7urqM6eDeBheAFi5w/AccountOverviewQuery?*',
      },
    ],
    this.onRequestsCaptured.bind(this),
  );

  public async onStart(): Promise<void> {
    console.log('On Start');
    this.requestRecorder.start();
    await chrome.tabs.create({
      url: 'https://x.com/i/account_analytics/overview',
    });
    this.setProgress(30);
  }

  private async onRequestsCaptured(log: Array<Request>) {
    console.log('onRequestsCaptured');
    this.setProgress(60);
    const notary = await TLSNotary.new('x.com');
    console.log('LOG:', log[0]);

    const reqLog = log[0];

    // Extract the original URL and parse the variables
    const originalUrl = reqLog.url;
    const url = new URL(originalUrl);
    const variablesParam = url.searchParams.get('variables');


    const originalVariables = JSON.parse(decodeURIComponent(variablesParam || ''));

    // Extract only the required parameters
    const minimalVariables = {
      requested_metrics: ['Follows'], // Use minimal metric instead of all metrics
      to_time: originalVariables.to_time,
      from_time: originalVariables.from_time,
      granularity: originalVariables.granularity,
      show_verified_followers: originalVariables.show_verified_followers,
    };

    // Create the new URL with minimal parameters
    const baseUrl = `${url.protocol}//${url.host}${url.pathname}`;
    const newVariablesParam = encodeURIComponent(
      JSON.stringify(minimalVariables),
    );
    const newUrl = `${baseUrl}?variables=${newVariablesParam}`;

    // Update the request log
    reqLog.url = newUrl;

    console.log('newUrl:', newUrl);

    reqLog.headers = { ...log[0].headers };
    delete reqLog.headers['Accept-Encoding'];
    const result = await notary.transcript(reqLog);
    if (result instanceof Error) {
      this.result(result);
      return;
    }
    const [transcript] = result;
    const responseBody = String.fromCharCode(...transcript.recv);

    const verifiedFollowersMatch = responseBody.match(
      /"verified_follower_count":"(\d+)"/,
    );
    const userIdMatch = responseBody.match(/"id":"(VXNlcjo[A-Za-z0-9+/=]+)"/);

    console.log({ responseBody, verifiedFollowersMatch, userIdMatch });

    const commit: Commit = {
      sent: [{ start: 0, end: transcript.sent.length }],
      recv: [],
    };

    // Add verified followers if found
    // Add verified followers if found
    if (verifiedFollowersMatch) {
      const start = verifiedFollowersMatch.index;
      if (start && start >= 0) {
        commit.recv.push({
          start: start,
          end: start + verifiedFollowersMatch[0].length,
        });
      }
    }

    // Add user ID if found
    if (userIdMatch) {
      const start = userIdMatch.index;
      if (start && start >= 0) {
        commit.recv.push({
          start: start,
          end: start + userIdMatch[0].length,
        });
      }
    }

    this.result(await notary.notarize(commit));
  }

  public async onStop(): Promise<void> {
    this.requestRecorder.stop();
  }
}
