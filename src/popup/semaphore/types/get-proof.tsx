import { TSemaphoreProofServer } from '../../types';

type TGetProof = (
  identityCommitment: string,
  semaphoreGroupId: string,
) => Promise<TSemaphoreProofServer | void>;

export default TGetProof;
