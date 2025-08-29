import React, { FC, useState, useMemo, useEffect } from 'react';
import {
  Container,
  LogoWrapperStyled,
  TitleStyled,
  Content,
  ButtonsContainer,
  MessageStyled,
  TextStyled,
  Image,
  ButtonStyled,
  NoteStyled,
  OpenPopupButton,
  UserStatusRequired,
  UserStatus,
  VerificationsSelectListStyled,
} from './styled-components';
import TProps from './types';
import { useVerifications } from '../../store/reducers/verifications';
import { defineUserStatus, getCurrentTab } from '../../utils';
import { Tag } from '../../../components';
import BringGif from './bring.gif';
import { TExtensionRequestType, TUserStatus, TVerification } from '../../types';
import manager from '../../manager';
import { tasks } from '../../../common/core';

const defineIfButtonIsDisabled = (
  isEnoughPoints: boolean,
  pointsRequired: number,
  pointsSelected: number,
) => {
  if (!isEnoughPoints) return true;
  if (pointsRequired > pointsSelected) {
    return true;
  }
};

const showInsufficientPointsNote = (
  isEnoughPoints: boolean,
  pointsRequired: number,
  points: number,
  requiredStatus: TUserStatus,
  onClose: () => void,
) => {
  if (isEnoughPoints) return null;

  return (
    <NoteStyled title="Insufficient trust level" status="warning">
      You need {pointsRequired - points} more points to reach {requiredStatus}{' '}
      level.{' '}
      <OpenPopupButton
        onClick={async () => {
          onClose();
        }}
      >
        Complete verifications
      </OpenPopupButton>{' '}
      to increase your trust score.
    </NoteStyled>
  );
};

const defineInitialVerifications = (verifications: TVerification[]) => {
  const verificationsCompleted = verifications.reduce<string[]>((res, item) => {
    if (item.status === 'completed') {
      return [...res, item.credentialGroupId];
    }

    return res;
  }, []);

  return verificationsCompleted;
};

const showInsufficientPointsMessage = (
  isEnoughPoints: boolean,
  pointsRequired: number,
  requiredStatus: TUserStatus,
) => {
  if (isEnoughPoints) return null;
  return (
    <MessageStyled status="error">
      <span>
        Required: <UserStatusRequired>{requiredStatus}</UserStatusRequired>
      </span>
      <Tag status="error">{pointsRequired} pts</Tag>
    </MessageStyled>
  );
};

const ConfirmationOverlay: FC<TProps> = ({
  onClose,
  dropAddress,
  pointsRequired, // points required
  host,
  points, // all points available
  userStatus,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const isEnoughPoints = points >= pointsRequired;
  const requiredStatus = defineUserStatus(pointsRequired);
  const availableTasks = tasks();
  const verificationsState = useVerifications();
  const [selected, setSelected] = useState<string[]>([]);

  const pointsSelected = useMemo(() => {
    let result = 0;

    verificationsState.verifications.forEach((verification) => {
      const relatedTask = availableTasks.find(
        (task) => task.credentialGroupId === verification.credentialGroupId,
      );
      console.log({
        relatedTask,
      });
      if (!relatedTask) {
        return;
      }
      if (verification.status !== 'completed') {
        return;
      }
      if (!selected.includes(relatedTask?.credentialGroupId)) {
        return;
      }
      if (relatedTask) {
        result = result + relatedTask?.points;
      }
    });

    return result;
  }, [selected]);

  useEffect(() => {
    if (!verificationsState.verifications) {
      return;
    }

    setSelected(defineInitialVerifications(verificationsState.verifications));
  }, [verificationsState.verifications]);

  return (
    <Container>
      <Content>
        <LogoWrapperStyled icon={<Image src={BringGif} />} />
        <TitleStyled>Prove your trust level</TitleStyled>

        <TextStyled>
          A website is requesting verification of your trust score. This process
          is completely private and no personal information will be shared.
        </TextStyled>
        {showInsufficientPointsNote(
          isEnoughPoints,
          pointsRequired,
          points,
          requiredStatus,
          onClose,
        )}
        {showInsufficientPointsMessage(
          isEnoughPoints,
          pointsRequired,
          requiredStatus,
        )}
        <MessageStyled>
          <span>
            Current: <UserStatus>{userStatus}</UserStatus>
          </span>
          <Tag status="info">{points} pts</Tag>
        </MessageStyled>
        {isEnoughPoints && (
          <VerificationsSelectListStyled
            tasks={availableTasks}
            verifications={verificationsState.verifications}
            selected={selected}
            onSelect={(id, isSelected) => {
              if (!isSelected) {
                setSelected(
                  selected.filter((verification) => verification !== id),
                );
                return;
              }
              setSelected([...selected, id]);
            }}
          />
        )}
        <ButtonsContainer>
          <ButtonStyled
            loading={loading}
            size="default"
            disabled={defineIfButtonIsDisabled(
              isEnoughPoints,
              pointsRequired,
              pointsSelected,
            )}
            appearance="action"
            onClick={async () => {
              setLoading(true);
              try {
                const proofs = await manager.getProofs(
                  dropAddress,
                  pointsRequired,
                  selected,
                );

                console.log({ proofs });

                const tab = await getCurrentTab();
                if (tab) {
                  chrome.tabs.sendMessage(tab.id as number, {
                    type: TExtensionRequestType.proofs_generated,
                    payload: proofs,
                  });
                } else {
                  alert('NO TAB DETECTED');
                }

                onClose();
                window.close();
              } catch (err) {
                setLoading(false);
                console.log({ err });
              }
              setLoading(false);
            }}
          >
            Confirm ({pointsSelected} pts)
          </ButtonStyled>

          <ButtonStyled
            size="default"
            onClick={async () => {
              onClose();
              window.close();

              const tab = await getCurrentTab();

              if (tab) {
                chrome.tabs.sendMessage(tab.id as number, {
                  type: TExtensionRequestType.proofs_rejected,
                });
              } else {
                alert('NO TAB DETECTED');
              }
            }}
          >
            Cancel
          </ButtonStyled>
        </ButtonsContainer>
      </Content>
    </Container>
  );
};

export default ConfirmationOverlay;
