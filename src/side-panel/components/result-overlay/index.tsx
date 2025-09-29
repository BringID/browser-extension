import React, { FC, useState, useMemo, useEffect } from 'react';
import {
  Container,
  TitleStyled,
  Content,
  ButtonsContainer,
  TextStyled,
  Image,
  ButtonStyled,
  Header,
  Result,
  ActionTextStyled,
  CheckboxStyled,
  SubtitleStyled,
  Hr,
  FlexData,
  FlexDataTitle,
  FlexDataValue,
  TagStyled,
  CopyIconStyled,
  Footer
} from './styled-components'
import { defineGroup, createSemaphoreIdentity } from '../../../common/utils';
import TProps from './types'
import { downloadDataAsFile } from '../../utils';
import { Task } from '../../../common/core';
import { tasks } from '../../../common/core';
import { shortenString } from '../../../common/utils';

const defineButtons = (
  checked: boolean,
  onAccepted: () => void,
  onReject: () => void
) => {
  return <ButtonsContainer>
    <ButtonStyled onClick={onAccepted} appearance="action" disabled={!checked}>
      Publish
    </ButtonStyled>

    <ButtonStyled onClick={onReject}>
      Cancel
    </ButtonStyled>

  </ButtonsContainer>
};

const defineSemaphoreIdentityCommitment = (
  taskConfig: Task,
  transcriptRecv: string,
  masterKey: string
) => {
  const groupData = defineGroup(
    transcriptRecv,
    taskConfig.groups
  )

  if (groupData && masterKey) {
    const semaphoreIdentity = createSemaphoreIdentity(
      masterKey,
      groupData.credentialGroupId
    )

    return semaphoreIdentity.commitment
  }

  return null
}

const ResultOverlay: FC<TProps> = ({
  taskIndex,
  onAccept,
  onReject,
  transcriptRecv,
  transcriptSent,
  masterKey
}) => {
  const [checked, setChecked] = useState<boolean>(false);

  const availableTasks = tasks()
  const currentTask = availableTasks[taskIndex]

  const semaphoreIdentityCommitment = defineSemaphoreIdentityCommitment(
    currentTask,
    transcriptRecv,
    masterKey
  )

  return (
    <Container>
      {/* <Header>
        
      </Header> */}
      <Content>
        <TitleStyled>
          Register verification onchain
        </TitleStyled>
        <TextStyled>
          Publish a Semaphore commitment from your Uber account. No personal data goes onchain.
        </TextStyled>

        <Result>
          <SubtitleStyled>
            Notarization summary

            <TagStyled
              status='default'
            >
              {
                currentTask.title
              }
            </TagStyled>
          </SubtitleStyled>
          <TextStyled>
            Visible only to the BringID notary during verification; not stored or published.
          </TextStyled>
          <ActionTextStyled onClick={() => {
            downloadDataAsFile({
              transcriptRecv,
              transcriptSent
            })
          }}>Download notarization details JSON (~12 KB)</ActionTextStyled>

          <Hr />

          <SubtitleStyled>
            Published onchain
          </SubtitleStyled>

          <FlexData>
            <FlexDataTitle>
              Semaphore Identity Commitment (IC):
            </FlexDataTitle>

            <FlexDataValue>
              {shortenString(String(semaphoreIdentityCommitment), 4)}
              <CopyIconStyled />
            </FlexDataValue>
          </FlexData>

          <TextStyled>
            Derived as a hash of your account ID. Not tied to your wallet. Proofs are unlinkable (per-request nullifiers).
          </TextStyled>
        </Result>
      </Content>

      <Footer>
        <CheckboxStyled
          title='Only my Semaphore commitment is published onchain; it is not tied to my wallet, and proofs are unlinkable.'
          checked={checked}
          onClick={(
            checked
          ) => {
            setChecked(checked)
          }}
          id={1}
        />

        {defineButtons(
          checked,
          onAccept,
          onReject
        )}
      </Footer>
    </Container>
  );
};

export default ResultOverlay;
