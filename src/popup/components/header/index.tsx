import React, { FC } from 'react';
import { Header, TitleStyled, UserStatus } from './styled-components';
import TProps from './types';
import { Tag } from '../../../components';

const HeaderComponent: FC<TProps> = ({ status, points }) => {
  return (
    <Header>
      <TitleStyled>
        Trust level: <UserStatus>{status}</UserStatus>
      </TitleStyled>
      <Tag status="info">{points} points</Tag>
    </Header>
  );
};

export default HeaderComponent;
