import { TVerification } from "../../types"

type TCreateVerification = (
  credentialGroupId: string,
  idHash: string,
  identityCommitment: string,
  verifierSignature: string
) => Promise<TVerification | void>


export default TCreateVerification