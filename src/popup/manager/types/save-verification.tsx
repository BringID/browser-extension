import { TVerification, TVerifyResult } from '../../types';

type TSaveVerification = (
  verificationData: TVerifyResult,
  credentialGroupId: string,
) => Promise<TVerification | void>;

export default TSaveVerification;
