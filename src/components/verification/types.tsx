import { TVerificationStatus } from '../../common/types';

export type TProps = {
  taskId?: string;
  icon?: string;
  title: string;
  description?: string;
  points: number;
  scheduledTime: number;
  status: TVerificationStatus;
  selectable: boolean;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  credentialGroupId: string;
  fetched: boolean;
};
