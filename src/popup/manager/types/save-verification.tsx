import { TVerification, TVerifyResult } from "../../types"

type TSaveVerification = (
  verificationData: TVerifyResult,
  credentialGroupId: string,
  identityCommitment: string
) => Promise<TVerification | void>

export default TSaveVerification