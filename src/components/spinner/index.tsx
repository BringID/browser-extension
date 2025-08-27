import React, { FC } from 'react';
import { SpinnerContainer } from './styled-components';
import TProps from './types';

const Spinner: FC<TProps> = ({ className, size }) => {
  return <SpinnerContainer className={className} size={size} />;
};

export default Spinner;
