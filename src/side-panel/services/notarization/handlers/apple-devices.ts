import { SimpleHandlerConfig } from '../types';
import { JsonValue } from 'type-fest';

type TDevice = Record<string, string | boolean | number | null>;

type TDevicesResponse = {
  devices: TDevice[];
};

export const AppleDevicesHandlerConfig: SimpleHandlerConfig = {
  name: 'Apple Devices',
  request: {
    method: 'GET',
    urlPattern: 'https://appleid.apple.com/account/manage/security/devices',
  },
  redirect: 'https://account.apple.com/account/manage/section/devices',
  tlsnConfig: {
    serverDns: 'account.apple.com',
    maxSentData: 2500,
    maxRecvData: 24000,
  },
  replayRequestCfg: {
    headers: {
      custom: {
        Accept: 'application/json',
        'Accept-Encoding': 'identity',
        Connection: 'close',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      },
      cookie: {
        whitelist: ['aidsp'],
      },
    },
  },
  transcriptDisclose: ['/devices'],
  responseMiddleware: async (_, response: JsonValue) => {
    const { devices } = response as TDevicesResponse;

    if (devices === undefined) {
      return new Error('apple_data_not_found');
    }
    if (devices.length === 0) {
      return new Error('apple_not_enough_data');
    }
  },
};
