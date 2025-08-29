import React, { FC } from 'react';
import TProps from './types';
import { LogoWrapper, Image } from './styled-components';

const defineImage = (icon?: string | React.ReactNode) => {
  if (!icon) return null;
  if (typeof icon === 'string') {
    return <Image src={icon} />;
  }

  return icon;
};

const Component: FC<TProps> = ({ className, icon }) => {
  return <LogoWrapper className={className}>{defineImage(icon)}</LogoWrapper>;
};

export default Component;
