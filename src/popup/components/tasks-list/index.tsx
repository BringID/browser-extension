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
  tasks
}) => {
  console.log({ tasks })
  return (
    <Container>
      {tasks.map((task, idx) => 
        <Task
          key={idx}
          title={task.title}
          description={task.description}
          taskId={String(idx)}
          points={task.points}
        />
      )}
    </Container>
  );
}

export default TasksList