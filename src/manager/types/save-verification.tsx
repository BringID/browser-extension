import { TVerification, TVerifyResult } from '../../common/types';

type TSaveVerification = (
  verificationData: TVerifyResult,
  credentialGroupId: string,
) => Promise<TVerification | void>;

export default TSaveVerification;
