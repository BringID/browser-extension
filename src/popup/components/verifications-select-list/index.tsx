import React, {
  FC
} from 'react'

import {
  Container,
} from './styled-components'
import { Task, Verification } from '../../../components'
import TProps from './types'
import NoVerificationsFound from '../no-verifications-found'

const VerificationsSelectList: FC<TProps> = ({
  tasks,
  verifications,
  onSelect,
  selected,
  className
}) => {

  return (
    <Container className={className}>
      {verifications.map((verification, idx) => {
        const taskId = String(idx + 1)
        const relatedTask = tasks.find((task, idx) => taskId === verification.credentialGroupId)
        if (relatedTask) {
          const isSelected = selected.includes(taskId)
          return <Verification
            key={taskId}
            title={relatedTask.title}
            description={relatedTask.description}
            taskId={taskId}
            points={relatedTask.points}
            scheduledTime={verification.scheduledTime}
            status='default'
            selectable={true}
            selected={isSelected}
            onSelect={(selected) => {
              onSelect(
                taskId,
                selected
              )
            }}
          />
        }
      })}
    </Container>
  )
}

export default VerificationsSelectList