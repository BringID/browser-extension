import api from '../../utils/api';
import {
  TAddVerification,
  TAddVerificationResponse,
  TGetTask,
  TGetTaskResponse,
} from './types';
import app from '../../configs';

const addVerification: TAddVerification = (
  registry,
  credentialGroupId,
  idHash,
  identityCommitment,
  verifierSignature,
) =>
  api<TAddVerificationResponse>(
    `${app.TASK_MANAGER_API}/api/v1/verification/tasks`,
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

const getTask: TGetTask = (taskId) =>
  api<TGetTaskResponse>(
    `${app.TASK_MANAGER_API}/api/v1/verification/tasks/${taskId}`,
    'GET',
  );

const taskManager = {
  addVerification,
  getTask,
};

export default taskManager;
