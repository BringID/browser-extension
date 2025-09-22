import React from 'react';

export type TNoteStatus = 'error' | 'default' | 'warning' | 'info';

type TProps = {
  className?: string;
  title?: string;
  children?: React.ReactNode | React.ReactNode[];
  status?: TNoteStatus;
};

export default TProps;
