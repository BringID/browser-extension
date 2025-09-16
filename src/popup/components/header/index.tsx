import React, { FC } from 'react';
import {
  Header,
  TextStyled,
  ButtonStyled,
  AddressText,
  TitleStyled,
  Content,
  Texts,
  Address,
} from './styled-components';
import TProps from './types';
import getStorage from '../../db-storage';
import { shortenString } from '../../utils';
import AddressIcon from '../../../components/icons/address';

const defineContent = (address: string | null, points: number) => {
  if (!address) {
    return <TitleStyled>BringID</TitleStyled>
  }

  return (
    <Content>
      <Texts>
        <Address>
          <AddressIcon /> <AddressText>{shortenString(address)}</AddressText>
        </Address>
        <TextStyled>Total Bring Score: {points}</TextStyled>
      </Texts>
      <ButtonStyled
        onClick={async () => {
          const storage = await getStorage();
          await storage.destroyUser();
        }}
      >
        Logout
      </ButtonStyled>
    </Content>
  );
};

const HeaderComponent: FC<TProps> = ({ points, address }) => {
  return <Header>{defineContent(address, points)}</Header>;
};

export default HeaderComponent;
