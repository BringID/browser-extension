import { TVerificationStatus } from '../../popup/types';

export type TProps = {
  taskId: string;
  icon?: string;
  title: string;
  description?: string;
  points: number;
  scheduledTime: number;
  status: TVerificationStatus;
  selectable: boolean;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
};
