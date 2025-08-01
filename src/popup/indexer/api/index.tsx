import {
  TGetProof,
  TGetProofResponse
} from './types'
import config from '../../configs'
import { api } from '../../utils'

const getProof: TGetProof = (
  apiUrl: string,
  identityCommitment,
  semaphoreGroupId
) => api<TGetProofResponse>(
  `${apiUrl}/api/v1/proofs?identity_commitment=${identityCommitment}&semaphore_group_id=${semaphoreGroupId}`,
  'GET',
  {}
)

const indexer = {
  getProof
}

export default indexer