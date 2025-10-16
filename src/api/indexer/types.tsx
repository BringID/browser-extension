import { TSemaphoreProofServer } from '../../common/types';

type TGetProofResponse = Promise<{
  success: boolean;
  proof: TSemaphoreProofServer;
}>;

type TGetProof = (
  apiUrl: string,
  identityCommitment: string,
  semaphoreGroupId: string,
  fetchProofs?: boolean
) => Promise<TGetProofResponse>;

export { TGetProof, TGetProofResponse };
