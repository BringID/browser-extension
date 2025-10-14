import api from '../../utils/api';
import { TVerify, TVerifyResponse } from './types';
import configs from '../../../configs';
import { createQueryString } from '../../utils';

const verify: TVerify = (
  apiUrl,
  presentationData,
  registry,
  credentialGroupId,
  semaphoreIdentityCommitment,
) => {

  const queryParams = createQueryString({
    environment: configs.CHAIN_ID === '84532' ? 'staging' : undefined
  })

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
}

const verifyService = {
  verify,
};

export default verifyService;
