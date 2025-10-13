import configs from '../../../configs';
import { createQueryString } from '../../utils';
import api from '../../utils/api';
import { TGetProof, TGetProofResponse } from './types';

const getProof: TGetProof = (apiUrl, identityCommitment, semaphoreGroupId, fetchProofs) => {
  const queryParams = createQueryString({
    identity_commitment: identityCommitment,
    semaphore_group_id: semaphoreGroupId,
    fetch_proofs: fetchProofs
  })
  const response = api<TGetProofResponse>(
    `${apiUrl}/v1/indexer/base/proofs?${queryParams}`,
    'GET',
    {
      Authorization: `Bearer ${configs.ZUPLO_KEY}`,
    },
  );

  return response;
};

const indexer = {
  getProof,
};

export default indexer;
