import TVerifyResult from "../../types/verify-result"

type TVerify = (
  apiKey: string,
  presentationData: string,
  credentialGroupId: string,
  semaphoreIdentityCommitment: string
) => Promise<TVerifyResult | void>

export default TVerify