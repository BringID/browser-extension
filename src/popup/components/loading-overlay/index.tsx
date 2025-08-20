import React, { FC } from 'react';
import {
  Container,
  SpinnerStyled,
  TitleStyled,
  Content,
} from './styled-components';

const LoadingOverlay: FC = () => {
  return (
    <Container>
      <Content>
        <TitleStyled>Processing verification...</TitleStyled>
        <SpinnerStyled size="large" />
      </Content>
    </Container>
  );
};

export default LoadingOverlay;
