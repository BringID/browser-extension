import api from '../../utils/api';
import { TVerify, TVerifyResponse } from './types';
import app from '../../configs';

const verify: TVerify = (
  apiUrl,
  apiKey,
  presentationData,
  registry,
  credentialGroupId,
  semaphoreIdentityCommitment,
) =>
  api<TVerifyResponse>(
    `${app.VERIFIER_API}/verify `,
    'POST',
    {
      'x-api-key': apiKey,
    },
    {
      tlsn_presentation: presentationData,
      registry,
      credential_group_id: credentialGroupId,
      semaphore_identity_commitment: semaphoreIdentityCommitment,
    },
  );

const verifyService = {
  verify,
};

export default verifyService;
