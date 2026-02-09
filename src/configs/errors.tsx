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
    binance_kyc_not_verified: 'KYC not finished',
    okx_data_not_found: 'Not enough data about OKX KYC presented',
    okx_kyc_not_verified: 'OKX KYC not verified',
    apple_subscriptions_data_not_found: 'No related data found about subscriptions',
    apple_no_active_subscriptions: 'No active subscriptions found',
    apple_no_paid_subscriptions: "No paid subscriptions found"
  },
};

export default errors;
