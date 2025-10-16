import { TVerification } from '../../../common/types';
import { Task } from '../../../common/core';

type TProps = {
  className?: string;
  tasks: Task[];
  verifications: TVerification[];
  selected: string[];
  onSelect: (id: string, selected: boolean) => void;
};

export default TProps;
