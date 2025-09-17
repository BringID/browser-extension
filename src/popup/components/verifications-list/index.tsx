import React, { FC } from 'react';

import { Container, ButtonStyled } from './styled-components';
import { Verification } from '../../../components';
import TProps from './types';
import NoVerificationsFound from '../no-verifications-found';
import { defineTaskByCredentialGroupId } from '../../utils';

const VerificationsList: FC<TProps> = ({
  tasks,
  verifications,
  onAddVerifications,
  className,
}) => {
  return (
    <Container className={className}>
      {verifications.length === 0 && (
        <NoVerificationsFound title="No verifications yet" />
      )}
      {verifications.length > 0 &&
        verifications.map((verification) => {
          const relatedTaskData = defineTaskByCredentialGroupId(
            verification.credentialGroupId,
          );
          if (relatedTaskData) {
            return (
              <Verification
                fetched={verification.fetched}
                key={relatedTaskData.taskId}
                title={relatedTaskData.title}
                description={relatedTaskData.description}
                taskId={verification.taskId}
                points={relatedTaskData.group.points}
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
