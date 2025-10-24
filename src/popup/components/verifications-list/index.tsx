import React, { FC } from 'react';

import {
  Container,
  ButtonStyled,
  NoteStyled,
  LinkStyled,
} from './styled-components';
import { Verification } from '../../../components';
import TProps from './types';
import NoVerificationsFound from '../no-verifications-found';
import { defineTaskByCredentialGroupId } from '../../../common/utils';

const VerificationsList: FC<TProps> = ({
  tasks,
  verifications,
  onAddVerifications,
  className,
}) => {
  const hasAnyPendingVerification = verifications.find(
    (verification) =>
      verification.status === 'scheduled' || verification.status === 'pending',
  );

  return (
    <Container className={className}>
      {hasAnyPendingVerification && (
        <NoteStyled>
          We batch verifications for better privacy.{' '}
          <LinkStyled href="https://app.bringid.org/privacy" target="_blank">
            Learn more
          </LinkStyled>
        </NoteStyled>
      )}
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
