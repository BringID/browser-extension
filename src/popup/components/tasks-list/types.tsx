import { Task } from '../../../common/core';
import { TVerification } from '../../../common/types';

type TProps = {
  tasks: Task[];
  className?: string;
  verifications: TVerification[];
};

export default TProps;
