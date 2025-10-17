import TTaskType from './task-type';
import TTaskStatus from './task-status';

export type TTaskServer = {
  id: string;
  type: TTaskType;
  status: TTaskStatus;
  id_hash: string | null;
  registry: string;
  credential_group_id: string;
  verifier_signature: string;
  identity_commitment: string;
  batch_id: null | string;
  scheduled_time: number;
  created_at: string;
  updated_at: string;
  tx_hash: string;
};
