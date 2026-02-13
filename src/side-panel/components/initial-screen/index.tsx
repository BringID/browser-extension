import React, { FC } from "react"
import {
  HomeWrapper,
  HomeLogoStyled,
  HomeHeadline,
  HomeSubtext,
  HomeCTAButton,
  HomeFootnote,
} from '../styled-components'
import { Page } from '../../../components';

import BringGif from '../../../images/bring.gif';

const handleLearnMore = () => {
  chrome.tabs.create({ url: 'https://bringid.org' });
};

const InitialScreen: FC = () => {
  return (
    <Page>
      <HomeWrapper>
        <HomeLogoStyled icon={<img src={BringGif} style={{ width: 58, height: 58, objectFit: 'cover' }} />} status="error" />

        <HomeHeadline>
          Prove you're real.<br />
          Stay anonymous.
        </HomeHeadline>

        <HomeSubtext>
          BringID uses zkTLS to verify your web accounts without revealing personal data.
        </HomeSubtext>

        <HomeCTAButton onClick={handleLearnMore}>
          Learn more at bringid.org →
        </HomeCTAButton>

        <HomeFootnote>
          This extension activates when a verification request is received from a supported application.
        </HomeFootnote>
      </HomeWrapper>
    </Page>
  );
}

export default InitialScreen
