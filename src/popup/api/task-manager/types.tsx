import { TTaskServer } from '../../types';

type TAddVerificationResponse = {
  success: boolean;
  task: TTaskServer;
};

type TAddVerification = (
  apiUrl: string,
  registry: string,
  credentialGroupId: string,
  idHash: string,
  identityCommitment: string,
  verifierSignature: string,
) => Promise<TAddVerificationResponse>;

type TGetTaskResponse = Promise<{
  status: boolean;
  task: TTaskServer;
}>;

type TGetTask = (taskId: string) => Promise<TGetTaskResponse>;

export {
  TAddVerification,
  TGetTask,
  TGetTaskResponse,
  TAddVerificationResponse,
};
