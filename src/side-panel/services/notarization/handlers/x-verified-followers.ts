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
    url: (req) => {
      const url = new URL(req.url);
      const vars = JSON.parse(
        decodeURIComponent(url.searchParams.get('variables') || ''),
      );
      const newVariablesParam = encodeURIComponent(
        JSON.stringify({
          requested_metrics: ['Follows'],
          to_time: vars.to_time,
          from_time: vars.to_time,
          granularity: vars.granularity,
          show_verified_followers: vars.show_verified_followers,
        }),
      );
      return `${url.protocol}//${url.host}${url.pathname}?variables=${newVariablesParam}`;
    },
    headers: {
      custom: {
        Accept: '*/*',
        'Accept-Encoding': 'identity',
        Connection: 'close',
        'Content-Type': 'application/json',
      },
      whitelist: ['authorization', 'x-csrf-token'],
      cookie: {
        whitelist: ['auth_token', 'ct0'],
      },
    },
  },
  transcriptDisclose: [
    '/data/viewer_v2/user_results/result/verified_follower_count',
    '/data/viewer_v2/user_results/result/id',
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
