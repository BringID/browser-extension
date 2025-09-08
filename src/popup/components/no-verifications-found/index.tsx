import React, { FC } from 'react';
import TProps from './types';
import { Container, Title } from './styled-components';

const NoVerificationsFound: FC<TProps> = ({ className, title }) => {
  return (
    <Container className={className}>
      <Title>{title}</Title>
    </Container>
  );
};

export default NoVerificationsFound;
