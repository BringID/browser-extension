import { TSemaphoreProof } from "../../types"

type TGetProofs = (
  dropAddress: string,
  pointsRequired: number
) => Promise<TSemaphoreProof[]>

export default TGetProofs