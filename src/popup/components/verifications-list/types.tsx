import { TVerification } from '../../../common/types';
import { Task } from '../../../common/core';

type TProps = {
  tasks: Task[];
  verifications: TVerification[];
  onAddVerifications: () => void;
  className?: string;
};

export default TProps;
