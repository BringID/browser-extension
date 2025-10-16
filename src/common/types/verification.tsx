import { TVerificationStatus } from './verification-status';

export type TVerification = {
  status: TVerificationStatus;
  scheduledTime: number;
  credentialGroupId: string;
  batchId?: string | null;
  txHash?: string;
  fetched: boolean;
  taskId: string; // id of task saved in DB
};
