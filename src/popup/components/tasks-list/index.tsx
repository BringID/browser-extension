import React, { FC } from 'react';

import { Container, ButtonStyled } from './styled-components';
import { Task } from '../../../components';
import TProps from './types';

const TasksList: FC<TProps> = ({ tasks, className }) => {
  return (
    <Container className={className}>
      {tasks.map((task, idx) => (
        <Task
          key={task.credentialGroupId}
          title={task.title}
          description={task.description}
          taskId={task.credentialGroupId}
          points={task.points}
        />
      ))}
    </Container>
  );
};

export default TasksList;
