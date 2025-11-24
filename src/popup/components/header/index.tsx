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
import getStorage from '../../../db-storage';
import { shortenString } from '../../../common/utils';
import AddressIcon from '../../../components/icons/address';
import { TExtensionRequestType } from '../../types';

const defineContent = (address: string | null, points: number) => {
  if (!address) {
    return <TitleStyled>BringID</TitleStyled>;
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
          chrome.tabs.query({}, (tabs) => {
            for (const tab of tabs) {
              if (!tab.id) continue;
              chrome.tabs.sendMessage(tab.id, { type: TExtensionRequestType.logout });
            }
          });
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
