import TVerifyResult from '../../types/verify-result';

type TRunVerify = (
  presentationData: string,
  credentialGroupId: string,
) => Promise<TVerifyResult | void>;

export default TRunVerify;
