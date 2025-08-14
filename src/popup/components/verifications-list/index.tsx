import React, { FC } from 'react';

import { Container, ButtonStyled } from './styled-components';
import { Task, Verification } from '../../../components';
import TProps from './types';
import NoVerificationsFound from '../no-verifications-found';

const VerificationsList: FC<TProps> = ({
  tasks,
  verifications,
  onAddVerifications,
  className,
}) => {
  return (
    <Container className={className}>
      {verifications.length === 0 && (
        <NoVerificationsFound
          title="No verifications yet"
          text="Add verifications to prove your identity"
        />
      )}
      {verifications.length > 0 &&
        verifications.map((verification, idx) => {
          const relatedTask = tasks.find(
            (task) =>
              task.credentialGroupId === verification.credentialGroupId,
          );
          if (relatedTask) {
            return (
              <Verification
                fetched={verification.fetched}
                key={relatedTask.credentialGroupId}
                title={relatedTask.title}
                description={relatedTask.description}
                taskId={verification.taskId}
                points={relatedTask.points}
                scheduledTime={verification.scheduledTime}
                status={verification.status}
                selectable={false}
                credentialGroupId={verification.credentialGroupId}
              />
            );
          }
        })}

      <ButtonStyled onClick={onAddVerifications} appearance="action">
        Add verifications
      </ButtonStyled>
    </Container>
  );
};

export default VerificationsList;
