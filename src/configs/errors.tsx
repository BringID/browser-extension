type TErrors = {
  [type: string]: {
    [taskId: number]: {
      [name: string]: string;
    };
  };
};

const errors: TErrors = {
  notarization: {
    0: {
      not_enough_rides: 'Not enough trips made',
      required_data_not_found: 'No rides found',
    },
    1: {
      not_enough_followers: 'Not enough verified followers',
      required_data_not_found: 'Not verified followers found',
    },
    2: {
      not_enough_devices: 'No devices found',
      required_data_not_found: 'No devices found',
    },
  },
};

export default errors;
