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

export default TActivitiesResponse;
