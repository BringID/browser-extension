import IIndexer, {
  TGetProof
} from './types'
import indexerApi from './api'
import config from '../configs'

class Indexer implements IIndexer {

  apiUrl: string = ''

  constructor (
  
  ) {
    this.apiUrl = config.INDEXER_API
  }


  getProof: TGetProof = async (
    identityCommitment,
    semaphoreGroupId
  ) => {
    const response = await indexerApi.getProof(
      this.apiUrl,
      identityCommitment,
      semaphoreGroupId
    )
    const { success, proof } = response
    if (success) {
      return proof
    }
  }
}

const indexer = new Indexer()

export default indexer