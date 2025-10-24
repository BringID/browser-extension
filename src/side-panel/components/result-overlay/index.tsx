import React, { FC, useState } from 'react';
import {
  Container,
  TitleStyled,
  Content,
  ButtonsContainer,
  TextStyled,
  LockIconStyled,
  ButtonStyled,
  Result,
  ActionTextStyled,
  SubtitleStyled,
  Hr,
  TagStyled,
  Footer,
  ExpandableContainerStyled,
  MiniSubtitle,
} from './styled-components';
import TProps from './types';
import { downloadDataAsFile } from '../../utils';

const defineButtons = (
  onAccepted: () => void,
  onReject: () => void,
  loading: boolean,
) => {
  return (
    <ButtonsContainer>
      <ButtonStyled onClick={onAccepted} appearance="action" loading={loading}>
        Register verification
      </ButtonStyled>

      <ButtonStyled onClick={onReject}>Cancel</ButtonStyled>
    </ButtonsContainer>
  );
};

const ResultOverlay: FC<TProps> = ({
  title,
  onAccept,
  onReject,
  transcriptRecv,
  transcriptSent,
  loading,
}) => {
  return (
    <Container>
      <Content>
        <TitleStyled>Register verification</TitleStyled>
        <TextStyled>
          Publish your verification commitment. No personal data is stored or
          published.
        </TextStyled>

        <Result>
          <SubtitleStyled>
            Reveal to BringID Notary
            <TagStyled status="default">{title}</TagStyled>
          </SubtitleStyled>
          <TextStyled>
            Visible only to the BringID notary during verification. Not stored
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
            Only verification commitments are published onchain. They don't
            reveal your account, not linked to your wallet, and required to
            generate unique, unlinkable proofs when needed.
          </TextStyled>

          <ExpandableContainerStyled title="Learn more">
            <MiniSubtitle>Verification Commitment</MiniSubtitle>
            <TextStyled>
              A random public key generated from your BringID key.
            </TextStyled>

            <MiniSubtitle>Protected Account Hash</MiniSubtitle>
            <TextStyled>
              Your account ID, hashed with the notary's secret key to prevent
              brute-force lookups.
            </TextStyled>

            <Hr />

            <TextStyled>
              Privacy note: These commitments are never tied to your wallet.
              Each proof is unique and unlinkable.
            </TextStyled>
          </ExpandableContainerStyled>
        </Result>
      </Content>

      <Footer>{defineButtons(onAccept, onReject, loading)}</Footer>
    </Container>
  );
};

export default ResultOverlay;
