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
    this.requestRecorder.start();

    await chrome.tabs.create({
      url: 'https://x.com/i/account_analytics/overview',
    });
    this.currentStep = 1;
    if (this.currentStepUpdateCallback)
      this.currentStepUpdateCallback(this.currentStep);
  }

  private async onRequestsCaptured(log: Array<Request>) {
    console.log('onRequestsCaptured');
    this.currentStep = 2;
    if (this.currentStepUpdateCallback)
      this.currentStepUpdateCallback(this.currentStep);

    try {
      const notary = await TLSNotary.new(
        {
          serverDns: 'x.com',
          maxSentData: 1008,
          maxRecvData: 25000,
        },
        {
          logEveryNMessages: 100,
          verbose: true,
          logPrefix: '[WS Monitor / X-followers]',
          trackSize: true,
          expectedTotalBytes: 55000000 * 1.15,
          enableProgress: true,
          progressUpdateInterval: 500,
        },
      );
      console.log('LOG:', log[0]);

      // Create a deep copy of the request to avoid modifying the original
      const reqLog = {
        ...log[0],
        headers: { ...log[0].headers }, // Shallow copy of headers is fine since we're replacing them
      };

      // Store original headers for extraction
      const originalHeaders = log[0].headers;

      // Extract the original URL and parse the variables
      const originalUrl = log[0].url;
      const url = new URL(originalUrl);
      const variablesParam = url.searchParams.get('variables');

      const originalVariables = JSON.parse(
        decodeURIComponent(variablesParam || ''),
      );

      // Create minimal variables with "Follows" metric to avoid errors
      const minimalVariables = {
        requested_metrics: ['Follows'],
        to_time: originalVariables.to_time,
        from_time: originalVariables.to_time,
        granularity: originalVariables.granularity,
        show_verified_followers: originalVariables.show_verified_followers,
      };

      // Create the new URL with minimal parameters
      const baseUrl = `${url.protocol}//${url.host}${url.pathname}`;
      const newVariablesParam = encodeURIComponent(
        JSON.stringify(minimalVariables),
      );
      const newUrl = `${baseUrl}?variables=${newVariablesParam}`;

      // Update the copied request log
      reqLog.url = newUrl;

      // Extract required values from original headers
      const authorization =
        originalHeaders['authorization'] ||
        originalHeaders['Authorization'] ||
        '';
      const xCsrfToken =
        originalHeaders['x-csrf-token'] ||
        originalHeaders['X-Csrf-Token'] ||
        '';

      // Extract auth_token and ct0 from cookie
      const cookieHeader =
        originalHeaders['cookie'] || originalHeaders['Cookie'] || '';
      const authTokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
      const ct0Match = cookieHeader.match(/ct0=([^;]+)/);
      const authTokenValue = authTokenMatch ? authTokenMatch[1] : '';
      const ct0Value = ct0Match ? ct0Match[1] : '';

      // Create new headers with only required fields
      reqLog.headers = {
        Accept: '*/*',
        'Accept-Encoding': 'identity',
        Connection: 'close',
        'Content-Type': 'application/json',
      };

      // Add authorization if exists
      if (authorization) {
        reqLog.headers['Authorization'] = authorization;
      }

      // Add x-csrf-token if exists
      if (xCsrfToken) {
        reqLog.headers['X-Csrf-Token'] = xCsrfToken;
      }

      // Add cookies with both auth_token and ct0
      const cookies = [];
      if (authTokenValue) {
        cookies.push(`auth_token=${authTokenValue}`);
      }
      if (ct0Value) {
        cookies.push(`ct0=${ct0Value}`);
      }
      if (cookies.length > 0) {
        reqLog.headers['Cookie'] = cookies.join('; ');
      }

      console.log('Modified headers:', reqLog.headers);
      console.log('Original request preserved:', log[0]);

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

      // keep only HTTP method and URL and hide everything after in the response
      const sentEnd = `${reqLog.method} ${reqLog.url}`.length;

      const commit: Commit = {
        sent: [{ start: 0, end: sentEnd }],
        recv: [],
      };
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
    } catch (err) {
      console.error('Error during notarization:', err);
      console.log('Original request that failed:', log[0]);
      this.result(err as Error);
    }
  }
  public async onStop(): Promise<void> {
    this.requestRecorder.stop();
  }
}
