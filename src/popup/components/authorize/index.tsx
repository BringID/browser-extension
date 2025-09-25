import React, { FC } from 'react';
import TProps from './types';
import { Container, Title, ButtonsStyled } from './styled-components';
import configs from '../../../configs';

const Authorize: FC<TProps> = ({ className }) => {
  return (
    <Container className={className}>
      <Title>Connect your wallet to start verifying</Title>
      <ButtonsStyled
        appearance="action"
        onClick={() => {
          chrome.tabs.create({
            url: configs.CONNECT_WALLET_URL,
          });
        }}
      >
        Connect wallet
      </ButtonsStyled>
    </Container>
  );
};

export default Authorize;
