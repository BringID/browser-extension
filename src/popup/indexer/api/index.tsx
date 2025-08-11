import {
  TGetProof,
  TGetProofResponse
} from './types'
import config from '../../configs'
import api from '../../utils'

const getProof: TGetProof = (
  identityCommitment,
  semaphoreGroupId
) => api<TGetProofResponse>(
  `${config.INDEXER_API}/api/v1/proofs?identity_commitment=${identityCommitment}&semaphore_group_id=${semaphoreGroupId}`,
  'GET',
  {}
)

const indexer = {
  getProof
}

export default indexer