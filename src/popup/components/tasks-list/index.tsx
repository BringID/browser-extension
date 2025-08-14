import React, { FC } from 'react';

import { Container, ButtonStyled } from './styled-components';
import { Task } from '../../../components';
import TProps from './types';

const TasksList: FC<TProps> = ({
  tasks,
  className,
  verifications
}) => {
  return (
    <Container className={className}>
      {tasks.map((task, idx) => {
        const relatedVerification = verifications.find(
          (verification) =>
            task.credentialGroupId === verification.credentialGroupId,
        );
        return <Task
          key={task.credentialGroupId}
          status={relatedVerification?.status || 'default'}
          title={task.title}
          description={task.description}
          credentialGroupId={task.credentialGroupId}
          points={task.points}
        />
      })}
    </Container>
  );
};

export default TasksList;
