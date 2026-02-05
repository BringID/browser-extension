import { SimpleHandlerConfig } from '../types';
import { JsonValue } from 'type-fest';

type TOkxKycResponse = {
  code: number;
  data: {
    kycLevel?: number;
    uuid?: string;
  };
  detailMsg: string;
  error_code: string;
  error_message: string;
  msg: string;
};

export const OkxKycHandlerConfig: SimpleHandlerConfig = {
  name: 'OKX KYC',
  request: {
    method: 'GET',
    urlPattern: 'https://www.okx.com/v3/users/security/profile*',
  },
  redirect: 'https://www.okx.com/account/users',
  tlsnConfig: {
    serverDns: 'www.okx.com',
    maxSentData: 5000,
    maxRecvData: 50000,
  },
  replayRequestCfg: {
    headers: {
      custom: {
        'accept-encoding': 'identity',
        'accept': 'application/json',
        'app-type': 'web',
      },
      whitelist: [
        'authorization',
        'user-agent',
        'referer',
        'origin',
        'x-site-info',
        'x-id-group',
        'x-locale',
        'x-utc',
        'x-zkdex-env',
        'x-cdn',
      ],
      cookie: {
        whitelist: [
          'token',
          'uid',
          'ok-ses-id',
          'devId',
          '__cf_bm',
          'locale',
          'browserCheck',
        ],
      },
    },
  },
  transcriptDisclose: [
    '/code',
    '/data/kycLevel',
    '/data/uuid',
  ],
  responseMiddleware: async (_, response: JsonValue) => {
    const { code, data } = response as TOkxKycResponse;
    console.log({ code, data });

    if (code !== 0) {
      return new Error('okx_data_not_found');
    }

    if (!data || Object.keys(data).length === 0) {
      return new Error('okx_data_not_found');
    }

    if (data.kycLevel === undefined) {
      return new Error('okx_data_not_found');
    }

    // kycLevel >= 2 means KYC verified
    const kycPassed = data.kycLevel >= 2;

    if (!kycPassed) {
      return new Error('okx_kyc_not_verified');
    }
  },
};
