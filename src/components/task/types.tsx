import { TNotarizationGroup, TVerificationStatus } from '../../common/types';

export type TProps = {
  icon?: string;
  title: string;
  description?: string;
  status: TVerificationStatus;
  groups: TNotarizationGroup[];
  id: string;
  taskIndex: number;
};
