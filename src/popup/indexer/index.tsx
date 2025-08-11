import IIndexer, {
  TGetProof
} from './types'
import indexerApi from './api'

class Indexer implements IIndexer {

  getProof: TGetProof = async (
    identityCommitment,
    semaphoreGroupId
  ) => {
    const response = await indexerApi.getProof(identityCommitment, semaphoreGroupId)
    const { success, proof } = response
    if (success) {
      return proof
    }
  }
}

const indexer = new Indexer()

export default indexer