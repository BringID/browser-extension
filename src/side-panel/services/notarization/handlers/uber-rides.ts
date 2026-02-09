import { SimpleHandlerConfig } from '../types';
import { JsonValue } from 'type-fest';

export type TActivity = {
  uuid: string;
  description: string;
};

export type TUser = {
  uuid: string;
};

type TActivitiesResponse = {
  data: {
    activities: {
      past: {
        activities: TActivity[];
      };
    };
    currentUser: TUser;
  };
};

export const UberRidesHandlerConfig: SimpleHandlerConfig = {
  name: 'X-Uber',
  request: {
    method: 'POST',
    urlPattern: 'https://riders.uber.com/graphql',
  },
  redirect: 'https://riders.uber.com/trips',
  tlsnConfig: {
    serverDns: 'riders.uber.com',
    maxSentData: 704,
    maxRecvData: 5000,
  },
  replayRequestCfg: {
    headers: {
      custom: { 'content-type': 'application/json', 'x-csrf-token': 'x' },
      whitelist: [],
      cookie: {
        whitelist: ['sid', 'csid'],
      },
    },
    customBody: {
      query:
        '{currentUser {uuid} activities {past(limit: 10) {activities {uuid, description}}}}',
    },
  },
  transcriptDisclose: [
    '/data/currentUser/uuid',
    '/data/activities/past/activities',
  ],
  responseMiddleware: async (_, response: JsonValue) => {
    const {
      data: {
        currentUser,
        activities: {
          past: { activities: activitiesCheck },
        },
      },
    } = response as TActivitiesResponse;

    if (!currentUser.uuid || !activitiesCheck) {
      return new Error('uber_data_not_found');
    }

    if (
      activitiesCheck.filter((activity) => {
        return activity.description.indexOf('Canceled') === -1;
      }).length < 5
    ) {
      return new Error('uber_not_enough_data');
    }
  },
};
