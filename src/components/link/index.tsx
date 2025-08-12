import React, { FC } from 'react';
import TProps from './types';
import { Container } from './styled-components';

const Link: FC<TProps> = ({ children, className, target, href }) => {
  return (
    <Container href={href} target={target} className={className}>
      {children}
    </Container>
  );
};

export default Link;
