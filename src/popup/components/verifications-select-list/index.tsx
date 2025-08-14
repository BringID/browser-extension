import React, { FC } from 'react';

import { Container } from './styled-components';
import { Task, Verification } from '../../../components';
import TProps from './types';
import NoVerificationsFound from '../no-verifications-found';

const VerificationsSelectList: FC<TProps> = ({
  tasks,
  verifications,
  onSelect,
  selected,
  className,
}) => {
  return (
    <Container className={className}>
      {verifications.map((verification, idx) => {
        if (verification.status !== 'completed') {
          return;
        }
        const relatedTask = tasks.find(
          (task, idx) =>
            task.credentialGroupId === verification.credentialGroupId,
        );
        if (relatedTask) {
          const isSelected = selected.includes(relatedTask.credentialGroupId);
          return (
            <Verification
              key={relatedTask.credentialGroupId}
              title={relatedTask.title}
              description={relatedTask.description}
              taskId={relatedTask.credentialGroupId}
              points={relatedTask.points}
              scheduledTime={verification.scheduledTime}
              status="default"
              fetched={verification.fetched}
              selectable={true}
              selected={isSelected}
              credentialGroupId={verification.credentialGroupId}
              onSelect={(selected) => {
                onSelect(relatedTask.credentialGroupId, selected);
              }}
            />
          );
        }
      })}
    </Container>
  );
};

export default VerificationsSelectList;
