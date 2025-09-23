import React, { FC } from 'react';
import {
  Container,
  SpinnerStyled,
  TitleStyled,
  Content,
} from './styled-components';
import TProps from './types';

const LoadingOverlay: FC<TProps> = ({ title }) => {
  return (
    <Container>
      <Content>
        <TitleStyled>{title}</TitleStyled>
        <SpinnerStyled size="large" />
      </Content>
    </Container>
  );
};

export default LoadingOverlay;
