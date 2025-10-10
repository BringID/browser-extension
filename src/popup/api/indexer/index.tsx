import configs from '../../../configs';
import api from '../../utils/api';
import { TGetProof, TGetProofResponse } from './types';
import { defineZuploNetworkName } from '../../utils';

const getProof: TGetProof = (apiUrl, identityCommitment, semaphoreGroupId) => {
  const networkName = defineZuploNetworkName(
    configs.CHAIN_ID
  )
  return api<TGetProofResponse>(
    `${apiUrl}/v1/indexer/${networkName}/proofs?identity_commitment=${identityCommitment}&semaphore_group_id=${semaphoreGroupId}`,
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
