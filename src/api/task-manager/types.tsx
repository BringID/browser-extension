import { TTaskServer } from '../../common/types';

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

type TGetVerificationResponse = {
  success: boolean;
  task: TTaskServer;
};

type TGetVerification = (
  verificationId: string,
) => Promise<TGetVerificationResponse>;

export {
  TAddVerification,
  TGetVerification,
  TGetVerificationResponse,
  TAddVerificationResponse,
};
