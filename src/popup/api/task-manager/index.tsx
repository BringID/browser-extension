import api from '../../utils/api';
import {
  TAddVerification,
  TAddVerificationResponse,
  TGetVerification,
  TGetVerificationResponse,
} from './types';
import app from '../../configs';

const addVerification: TAddVerification = (
  apiUrl,
  registry,
  credentialGroupId,
  idHash,
  identityCommitment,
  verifierSignature,
) =>
  api<TAddVerificationResponse>(
    `${apiUrl}/api/v1/verification/tasks`,
    'POST',
    {},
    {
      registry: registry,
      credential_group_id: credentialGroupId,
      id_hash: idHash,
      identity_commitment: identityCommitment,
      verifier_signature: verifierSignature,
    },
  );

const getVerification: TGetVerification = (taskId) =>
  api<TGetVerificationResponse>(
    `${app.TASK_MANAGER_API}/api/v1/verification/tasks/${taskId}`,
    'GET',
  );

const taskManager = {
  addVerification,
  getVerification,
};

export default taskManager;
