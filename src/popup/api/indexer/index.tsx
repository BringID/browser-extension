import configs from '../../../configs';
import { createQueryString } from '../../utils';
import api from '../../utils/api';
import { TGetProof, TGetProofResponse } from './types';
import { defineZuploNetworkName } from '../../utils';

const getProof: TGetProof = (apiUrl, identityCommitment, semaphoreGroupId) => {
  const networkName = defineZuploNetworkName(
    configs.CHAIN_ID
  )
  const queryParams = createQueryString({
    identity_commitment: identityCommitment,
    semaphore_group_id: semaphoreGroupId,
    fetch_proofs: fetchProofs
  })
  const response = api<TGetProofResponse>(
    `${apiUrl}/v1/indexer/${networkName}/proofs?${queryParams}`,
    'GET',
    {
      Authorization: `Bearer ${configs.ZUPLO_KEY}`,
    },
  );
};

const indexer = {
  getProof,
};

export default indexer;
