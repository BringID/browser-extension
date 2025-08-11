import { TSemaphoreProofServer } from "../../types"

type TGetProofResponse = Promise<{
  success: boolean
  proof: TSemaphoreProofServer
}>

type TGetProof = (
  apiUrl: string,
  identityCommitment: string,
  semaphoreGroupId: string
) => Promise<TGetProofResponse>

export {
  TGetProof,
  TGetProofResponse
}