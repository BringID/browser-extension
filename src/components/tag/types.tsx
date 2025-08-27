import React from 'react';

export type TStatus = 'success' | 'default' | 'info' | 'error';

type TProps = {
  children?: React.ReactNode | React.ReactNode[];
  className?: string;
  status: TStatus;
};

export default TProps;
