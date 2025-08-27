import React from 'react';

type TProps = {
  onClick?: () => void;
  children: React.ReactNode | React.ReactNode[];
  className?: string;
  disabled?: boolean;
  appearance?: 'default' | 'action';
  size?: 'small' | 'default';
  loading?: boolean;
};

export default TProps;
