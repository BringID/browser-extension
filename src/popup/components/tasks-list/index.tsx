import React, {
  FC
} from 'react'

import {
  Container,
  ButtonStyled
} from './styled-components'
import { Task } from '../../../components'
import TProps from './types'

const TasksList: FC<TProps> = ({
  tasks,
  className
}) => {
  return (
    <Container className={className}>
      {tasks.map((task, idx) => 
        <Task
          key={idx + 1}
          title={task.title}
          description={task.description}
          taskId={String(idx + 1)}
          points={task.points}
        />
      )}
    </Container>
  );
}

export default TasksList