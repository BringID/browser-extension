import api from '../../utils/api';
import { TGetProof, TGetProofResponse } from './types';

const getProof: TGetProof = (apiUrl, identityCommitment, semaphoreGroupId) =>
  api<TGetProofResponse>(
    `${apiUrl}/api/v1/proofs?identity_commitment=${identityCommitment}&semaphore_group_id=${semaphoreGroupId}`,
    'GET',
    {},
  );

const indexer = {
  getProof,
};

export default indexer;
