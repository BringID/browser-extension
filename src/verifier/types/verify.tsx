import { TVerifyResult } from '../../common/types';

type TVerify = (
  presentationData: string,
  credentialGroupId: string,
  semaphoreIdentityCommitment: string,
) => Promise<TVerifyResult | void>;

export default TVerify;
