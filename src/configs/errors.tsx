import { TNotarizationError } from "../common/types";

type TErrors = {
  [type: string]: Record<TNotarizationError, string>
};

const errors: TErrors = {
  notarization: {
    uber_not_enough_data: 'Not enough trips made',
    uber_data_not_found: 'No rides found',
    twitter_not_enough_data: 'Not enough verified followers',
    twitter_data_not_found: 'Not verified followers found',
    apple_not_enough_data: 'Not enough devices found',
    apple_data_not_found: 'No devices found',
    binance_data_not_found: 'Not enough data about KYC presented',
    binance_kyc_not_verified: 'KYC not finished'
  },
};

export default errors;
