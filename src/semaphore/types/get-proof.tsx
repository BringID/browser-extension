import { TSemaphoreProofServer } from '../../common/types';

type TGetProof = (
  identityCommitment: string,
  semaphoreGroupId: string,
  fetchProofs?: boolean
) => Promise<TSemaphoreProofServer | void>;

export default TGetProof;
