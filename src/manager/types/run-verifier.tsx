import { TVerifyResult } from '../../common/types';

type TRunVerify = (
  presentationData: string,
  credentialGroupId: string,
) => Promise<TVerifyResult | void>;

export default TRunVerify;
