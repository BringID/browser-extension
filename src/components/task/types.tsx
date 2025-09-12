import { TNotarizationGroup } from '../../common/types';
import { TVerificationStatus } from '../../popup/types';

export type TProps = {
  icon?: string;
  title: string;
  description?: string;
  status: TVerificationStatus;
  groups: TNotarizationGroup[];
  id: string;
  taskIndex: number;
};
