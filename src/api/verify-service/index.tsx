import { TVerify, TVerifyResponse } from './types';
import configs from '../../configs';
import modeConfigs from '../../configs/mode-configs';

import { createQueryString, api } from '../../common/utils';

const verify: TVerify = async (
  apiUrl,
  presentationData,
  registry,
  credentialGroupId,
  semaphoreIdentityCommitment,
) => {

  const configsResult = await modeConfigs()
  const queryParams = createQueryString({
    environment: configsResult.CHAIN_ID === '84532' ? 'staging' : undefined,
  });

  return api<TVerifyResponse>(
    `${apiUrl}/v1/verifier/verify?${queryParams}`,
    'POST',
    {
      Authorization: `Bearer ${configs.ZUPLO_KEY}`,
    },
    {
      tlsn_presentation: presentationData,
      registry,
      credential_group_id: credentialGroupId,
      semaphore_identity_commitment: semaphoreIdentityCommitment,
    },
  );
};

const verifyService = {
  verify,
};

export default verifyService;
