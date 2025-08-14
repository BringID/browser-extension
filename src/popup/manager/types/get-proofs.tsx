import { TSemaphoreProof } from '../../types';

type TGetProofs = (
  dropAddress: string,
  pointsRequired: number,
  selectedVerifications: string[]
) => Promise<TSemaphoreProof[]>;

export default TGetProofs;
