import React, { FC } from 'react';
import TProps from './types';
import { Container } from './styled-components';

const Text: FC<TProps> = ({ children, className, onClick }) => {
  return <Container className={className} onClick={onClick}>{children}</Container>;
};

export default Text;
