import configs from '../../configs';
import modeConfigs from '../../configs/mode-configs';

import {
  api,
  defineZuploNetworkName,
  createQueryString,
} from '../../common/utils';
import { TGetProof, TGetProofResponse } from './types';

const getProof: TGetProof = async (
  apiUrl,
  identityCommitment,
  semaphoreGroupId,
  fetchProofs,
) => {
  const configsResult = await modeConfigs()
  const networkName = defineZuploNetworkName(configsResult.CHAIN_ID);
  const queryParams = createQueryString({
    identity_commitment: identityCommitment,
    semaphore_group_id: semaphoreGroupId,
    fetch_proofs: fetchProofs,
  });

  return api<TGetProofResponse>(
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
