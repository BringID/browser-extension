import React, { FC } from 'react';

import { Container } from './styled-components';
import { Verification } from '../../../components';
import TProps from './types';

const VerificationsSelectList: FC<TProps> = ({
  tasks,
  verifications,
  onSelect,
  selected,
  className,
}) => {
  return (
    <Container className={className}>
      {verifications.map((verification) => {
        if (verification.status !== 'completed') {
          return;
        }
        const relatedTask = tasks.find(
          (task) => task.credentialGroupId === verification.credentialGroupId,
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
