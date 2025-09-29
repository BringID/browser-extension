import { NotarizationBase } from '../notarization-base';
import { RequestRecorder } from '../../requests-recorder';
import { Request } from '../../../common/types';
import { TLSNotary } from '../../tlsn';
import { Commit } from 'tlsn-js';
import { Mapping, parse, Pointers } from 'json-source-map';

export class NotarizationAppleDevices extends NotarizationBase {
  requestRecorder: RequestRecorder = new RequestRecorder(
    [
      {
        method: 'GET',
        urlPattern: 'https://appleid.apple.com/account/manage/security/devices',
      },
    ],
    this.onRequestsCaptured.bind(this),
  );

  public async onStart(): Promise<void> {
    this.requestRecorder.start();
    await chrome.tabs.create({
      url: 'https://account.apple.com/account/manage/section/devices',
    });
    this.currentStep = 1;
    if (this.currentStepUpdateCallback)
      this.currentStepUpdateCallback(this.currentStep);
  }

  private async onRequestsCaptured(log: Array<Request>) {
    this.currentStep = 2;
    if (this.currentStepUpdateCallback)
      this.currentStepUpdateCallback(this.currentStep);
    console.log('[AppleDevices] Starting request processing...');
    console.log('[AppleDevices] Original request log:', log);

    const reqLog = log[0];

    // Extract necessary values before modifying
    const originalHeaders = { ...log[0].headers };
    const userAgent = originalHeaders['user-agent'] || originalHeaders['User-Agent'];

    // Extract aidsp cookie value
    const cookieHeader = originalHeaders['cookie'] || originalHeaders['Cookie'] || '';
    const aidspMatch = cookieHeader.match(/aidsp=([^;]+)/);
    const aidspValue = aidspMatch ? aidspMatch[1] : '';

    // Create new headers with only required fields
    reqLog.headers = {
      'Accept': 'application/json',
      'Accept-Encoding': 'identity',
      'Connection': 'close',
      'User-Agent': userAgent || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
    };

    // Add cookie only if aidsp value exists
    if (aidspValue) {
      reqLog.headers['Cookie'] = `aidsp=${aidspValue}`;
      console.log('[AppleDevices] Using aidsp cookie');
    } else {
      console.warn('[AppleDevices] Warning: aidsp cookie not found');
    }

    console.log('[AppleDevices] Final headers count:', Object.keys(reqLog.headers).length);
    console.log('[AppleDevices] Final headers:', reqLog.headers);

    try {
      const notary = await TLSNotary.new('account.apple.com', {
        logEveryNMessages: 100,
        verbose: true,
        logPrefix: '[WS Monitor - Cupertino]',
        trackSize: true,
        expectedTotalBytes: 50170000,
        enableProgress: true,
        progressUpdateInterval: 500,
      });
      this.setProgress(33);
      console.log('[AppleDevices] TLSNotary instance created');

      const result = await notary.transcript(reqLog);
      console.log('[AppleDevices] Transcript result:', result);

      if (result instanceof Error) {
        console.error('[AppleDevices] Error in transcript:', result);
        this.result(result);
        return;
      }
      const [transcript, message] = result;

      const commit: Commit = {
        sent: [{ start: 0, end: transcript.sent.length }],
        recv: [],
      };
      this.setProgress(66);
      // Find JSON start position in the response
      const responseText = Buffer.from(transcript.recv).toString('utf-8');
      const jsonStarts: number = responseText.indexOf('{');
      console.log(
        '[AppleDevices] Response text preview:',
        responseText.substring(0, 200),
      );
      console.log('[AppleDevices] JSON starts at position:', jsonStarts);

      const pointers: Pointers = parse(message.body.toString()).pointers;
      const devices: Mapping = pointers['/devices'];
      if (!devices || !devices.key?.pos) {
        this.result(new Error('required data not found'));
        return;
      }

      const dataLength = Buffer.from(
        message.body
          .toString()
          .substring(devices.key?.pos, devices.valueEnd.pos),
        'utf-8',
      ).length;

      commit.recv = [
        {
          start: jsonStarts + devices.key?.pos,
          end: jsonStarts + devices.key?.pos + dataLength,
        },
      ];

      console.log('Commit Length:', commit.recv[0].end - commit.recv[0].start);
      console.log(
        'Commit Data:',
        message.body
          .toString()
          .substring(devices.key?.pos, devices.valueEnd.pos),
      );

      if (commit.recv[0].end - commit.recv[0].start < 10) {
        this.result(new Error('not enough devices'));
        return;
      }

      this.setProgress(75);

      console.log('[AppleDevices] Starting notarization...');
      const notarizationResult = await notary.notarize(commit);
      console.log('[AppleDevices] Notarization completed:', notarizationResult);
      this.setProgress(99);

      this.result(notarizationResult);
    } catch (err) {
      this.result(err as Error);
    }
  }

  public async onStop(): Promise<void> {
    this.requestRecorder.stop();
  }
}
