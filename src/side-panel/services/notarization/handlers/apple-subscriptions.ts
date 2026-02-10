import { HandlerConfig } from '../types';
import { JsonValue } from 'type-fest';
import { newCommitForRequest } from '../helpers';
import { Transcript } from '../../tlsn/types';
import { ParsedHTTPMessage } from '../../../common/helpers/httpParser';
import { Request } from '../../../common/types';

type TSubscription = {
  subscriptionId: string;
  status: string;
  serviceType: string;
  publicationName: string;
  latestPlan?: {
    salableAdamId?: string;
    displayName?: string;
    expirationDateFormatted?: string;
    period?: string;
    paidPrice?: string;
    [key: string]: any;
  };
  [key: string]: any;
};

type TSubscriptionsResponse = {
  active?: TSubscription[];
};

export const AppleSubscriptionsHandlerConfig: HandlerConfig = {
  name: 'Apple Subscriptions',
  requests: [{
    method: 'GET',
    urlPattern: 'https://speedysub.apps.apple.com/subscription/v3/manage/list*',
  }],
  redirect: 'https://account.apple.com/account/manage/section/subscriptions',
  tlsnConfig: {
    serverDns: 'speedysub.apps.apple.com',
    maxSentData: 3200,
    maxRecvData: 24000,
  },
  requestMiddleware: async (requests: Request[]) => {
    const req = requests[0];

    // Filter cookies to only keep authentication-related ones
    const allowedCookies = ['myacinfo', 'commerce-authorization-token', 'caw', 'caw-at', 'dslang', 'site'];
    const filteredCookies = req.headers.Cookie?.split(';')
      .map(c => c.trim())
      .filter(c => allowedCookies.some(allowed => c.startsWith(allowed + '=')))
      .join('; ') || '';

    return {
      url: req.url,
      method: req.method,
      headers: {
        Accept: req.headers.Accept || 'application/json',
        'Accept-Language': req.headers['Accept-Language'] || 'en-us',
        'Content-Type': req.headers['Content-Type'] || 'application/json',
        'Accept-Encoding': 'identity',
        Connection: 'close',
        Origin: req.headers.Origin || 'https://apps.apple.com',
        Referer: req.headers.Referer || 'https://apps.apple.com/',
        'User-Agent': req.headers['User-Agent'] ||
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
        'x-apple-store-front': req.headers['x-apple-store-front'] || '',
        Cookie: filteredCookies,
      },
      body: req.body,
    };
  },
  transcriptMiddleware: async (
    requests: Request[],
    transcript: Transcript,
    message: ParsedHTTPMessage,
  ) => {
    // Parse the real response body
    let response: TSubscriptionsResponse;
    try {
      response = JSON.parse(message.body.toString());
    } catch (err) {
      console.error('[AppleSubscriptions] Failed to parse response:', err);
      return new Error('Failed to parse response JSON');
    }

    // Generate JSON pointers for only the fields we want to disclose
    const disclose: string[] = [];

    if (response.active && response.active.length > 0) {
      response.active.forEach((sub, index) => {
        disclose.push(`/active/${index}/subscriptionId`);
        disclose.push(`/active/${index}/status`);
        if (sub.latestPlan?.paidPrice !== undefined) {
          disclose.push(`/active/${index}/latestPlan/paidPrice`);
        }
      });
    }

    console.log('[AppleSubscriptions] Disclosing paths:', disclose);
    console.log('[AppleSubscriptions] Number of subscriptions:', response.active?.length || 0);

    return newCommitForRequest(
      requests[0],
      transcript,
      message,
      disclose,
    );
  },
  responseMiddleware: async (_, response: JsonValue) => {
    const { active } = response as TSubscriptionsResponse;

    if (active === undefined) {
      return new Error('apple_subscriptions_data_not_found');
    }

    if (active.length === 0) {
      return new Error('apple_no_active_subscriptions');
    }

    // Check that at least one subscription is active and has been paid for
    const hasPaidActiveSubscription = active.some((subscription) => {
      const isActive = subscription.status === 'Active';
      const hasPaidPrice =
        subscription.latestPlan?.paidPrice !== undefined &&
        subscription.latestPlan.paidPrice.length > 0;

      return isActive && hasPaidPrice;
    });

    if (!hasPaidActiveSubscription) {
      return new Error('apple_no_paid_subscriptions');
    }
  },
};
