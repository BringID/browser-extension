import React from 'react';

export type TStatus = 'default' | 'error'

type TProps = {
  className?: string;
  icon?: string | React.ReactNode;
  status?: TStatus
};

export default TProps;
