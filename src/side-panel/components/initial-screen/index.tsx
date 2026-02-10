import React, { FC } from "react"
import {
  Container,
  LogoWrapperStyled,
  Header,
  TitleStyled,
  Content,
  Wrapper,
  ButtonStyled,
  Buttons,
  TextStyled
} from '../styled-components'
import { Page } from '../../../components';

import BringGif from '../../../images/bring.gif';

  const handleOpenGithub = () => {
    chrome.tabs.create({ url: 'https://github.com/BringID/bringid' });
  };


const InitialScreen: FC = () => {
  return <Wrapper>
    <Page>
      <Container>
        <Header>
          <LogoWrapperStyled icon={<img src={BringGif} style={{ width: 58, height: 58, objectFit: 'cover' }} />} status="error" />
          <TitleStyled>BringID Extension</TitleStyled>
          <TextStyled>
            This extension works only with the BringID npm package.
            Use BringIDModal to trigger verifications.
          </TextStyled>
        </Header>
          
        <Content>
          <Buttons>
            <ButtonStyled appearance="action" onClick={handleOpenGithub}>
              View on GitHub
            </ButtonStyled>
          </Buttons>
        </Content>
          
      </Container>
    </Page>
  </Wrapper>
}


export default InitialScreen