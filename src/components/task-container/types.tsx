import { TVerificationStatus } from '../../popup/types';

type TProps = {
  status: TVerificationStatus;
  children: React.ReactNode | React.ReactNode[];
  icon?: string;
  title: string;
  description?: string;
  selectable: boolean;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  id: string;
};

export default TProps;
