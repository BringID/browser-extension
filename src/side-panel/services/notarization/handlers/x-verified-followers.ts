import { SimpleHandlerConfig } from '../types';
import { JsonValue } from 'type-fest';

export const XVerifiedFollowersHandlerConfig: SimpleHandlerConfig = {
  name: 'X Verified Followers',
  request: {
    method: 'GET',
    urlPattern:
      'https://x.com/i/api/graphql/LwtiA7urqM6eDeBheAFi5w/AccountOverviewQuery?*',
  },
  redirect: 'https://x.com/i/account_analytics/overview',
  tlsnConfig: {
    serverDns: 'x.com',
    maxSentData: 1008,
    maxRecvData: 25000,
  },
  replayRequestCfg: {
    headers: {
      custom: {
        Accept: '*/*',
        'Accept-Encoding': 'identity',
        Connection: 'close',
        'Content-Type': 'application/json',
      },
      cookie: {
        whitelist: ['auth_token', 'ct0'],
      },
    },
  },
  transcriptDisclose: [
    '/viewer_v2/user_results/result/verified_follower_count',
    '/viewer_v2/user_results/result/id',
  ],
  responseMiddleware: async (_, response: JsonValue) => {
    const verifiedFollowersMatch = JSON.stringify(response).match(
      /"verified_follower_count":"(\d+)"/,
    );
    if (!verifiedFollowersMatch) {
      return new Error('required_data_not_found');
    }
    if (verifiedFollowersMatch[1] && Number(verifiedFollowersMatch[1]) < 10) {
      return new Error('not_enough_followers');
    }
  },
};
