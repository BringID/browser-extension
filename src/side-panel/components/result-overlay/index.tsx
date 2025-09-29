import React, { FC, useState } from 'react';
import {
  Container,
  TitleStyled,
  Content,
  ButtonsContainer,
  TextStyled,
  Image,
  LockIconStyled,
  ButtonStyled,
  Header,
  Result,
  ActionTextStyled,
  CheckboxStyled,
  SubtitleStyled,
  Hr,
  TagStyled,
  Footer,
  ExpandableContainerStyled,
  MiniSubtitle
} from './styled-components';
import { defineGroup, createSemaphoreIdentity } from '../../../common/utils';
import TProps from './types';
import { downloadDataAsFile } from '../../utils';
import { Task } from '../../../common/core';

const defineButtons = (
  checked: boolean,
  onAccepted: () => void,
  onReject: () => void,
) => {
  return (
    <ButtonsContainer>
      <ButtonStyled
        onClick={onAccepted}
        appearance="action"
        disabled={!checked}
      >
        Publish
      </ButtonStyled>

      <ButtonStyled onClick={onReject}>Cancel</ButtonStyled>
    </ButtonsContainer>
  );
};

const defineSemaphoreIdentityCommitment = (
  taskConfig: Task,
  transcriptRecv: string,
  masterKey: string,
) => {
  const groupData = defineGroup(transcriptRecv, taskConfig.groups);

  if (groupData && masterKey) {
    const semaphoreIdentity = createSemaphoreIdentity(
      masterKey,
      groupData.credentialGroupId,
    );

    return semaphoreIdentity.commitment;
  }

  return null;
};

const ResultOverlay: FC<TProps> = ({
  title,
  onAccept,
  onReject,
  transcriptRecv,
  transcriptSent,
}) => {
  const [checked, setChecked] = useState<boolean>(false);

  return (
    <Container>
      {/* <Header>
        
      </Header> */}
      <Content>
        <TitleStyled>Register verification onchain</TitleStyled>
        <TextStyled>
          Publish a Semaphore commitment from your Uber account. No personal
          data goes onchain.
        </TextStyled>

        <Result>
          <SubtitleStyled>
            Notarization summary
            <TagStyled status="default">{title}</TagStyled>
          </SubtitleStyled>
          <TextStyled>
            Visible only to the BringID notary during verification; not stored
            or published.
          </TextStyled>
          <ActionTextStyled
            onClick={() => {
              downloadDataAsFile({
                transcriptRecv,
                transcriptSent,
              });
            }}
          >
            Download notarization details JSON (~12 KB)
          </ActionTextStyled>

          <Hr />

          <SubtitleStyled>
            <LockIconStyled />
            Publish onchain
          </SubtitleStyled>

          <TextStyled>
           Only verification commitments are published onchain. They don't reveal your Uber account, not linked to your wallet, and required to generate unique, unlinkable proofs when needed.
          </TextStyled>

          <ExpandableContainerStyled title="Learn more">
            <MiniSubtitle>
              Verification Commitment
            </MiniSubtitle>
            <TextStyled>
              A random public key generated from your BringID key.
            </TextStyled>

            <MiniSubtitle>
              Protected Account Hash
            </MiniSubtitle>
            <TextStyled>
              Your account ID, hashed with the notary's secret key to prevent brute-force lookups.
            </TextStyled>

            <Hr />

            <TextStyled>
              Privacy note: These commitments are never tied to your wallet. Each proof is unique and unlinkable.
            </TextStyled>
          </ExpandableContainerStyled>


        </Result>

      </Content>

      <Footer>
        <CheckboxStyled
          title="Only my Semaphore commitment is published onchain; it is not tied to my wallet, and proofs are unlinkable."
          checked={checked}
          onClick={(checked) => {
            setChecked(checked);
          }}
          id={1}
        />

        {defineButtons(checked, onAccept, onReject)}
      </Footer>
    </Container>
  );
};

export default ResultOverlay;
