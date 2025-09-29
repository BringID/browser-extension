import React, { FC, useState, useMemo, useEffect } from 'react';
import {
  Container,
  LogoWrapperStyled,
  TitleStyled,
  Content,
  ButtonsContainer,
  TextStyled,
  Image,
  ButtonStyled,
  NoteStyled,
  LinkStyled,
  Header,
  Result,
  CheckboxStyled
} from './styled-components'
import TProps from './types'
import { requestHostPermission, checkIfPermissionGranted } from '../../utils';
import { tasks } from '../../../common/core';

const defineButtons = (
  onAccepted: () => void,
  onReject: () => void
) => {
  return <ButtonsContainer>
    <ButtonStyled onClick={onAccepted} appearance="action">
      Publish
    </ButtonStyled>

    <ButtonStyled onClick={onReject}>
      Cancel
    </ButtonStyled>

  </ButtonsContainer>
};

const ResultOverlay: FC<TProps> = ({
  taskIndex,
  onAccept,
  onReject,
  transcriptRecv,
  transcriptSent
}) => {
  const [checked, setChecked] = useState<boolean>(false);

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

        </Result>

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
          onAccept,
          onReject
        )}

      </Content>
    </Container>
  );
};

export default ResultOverlay;
