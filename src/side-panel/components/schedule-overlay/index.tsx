import React, { FC, useState, useEffect } from 'react';
import {
  Container,
  LogoWrapperStyled,
  TitleStyled,
  TextStyled,
  Timer,
  ButtonStyled,
  Content,
  CheckIconStyled,
  ClockIconStyled,
  Footer,
  ButtonsContainer,
  BoldText,
} from './styled-components';
import TProps from './types';
import { msToTime } from '../../utils'

const ScheduleOverlay: FC<TProps> = ({ onClose, scheduledTime, onAction }) => {
  const [expiration, setExpiration] = useState<number>(1);

  useEffect(() => {
    const interval = setInterval(async () => {
      const now = +new Date();
      if (!scheduledTime) {
        return;
      }
      const expiration = scheduledTime - now;

      setExpiration(expiration < 0 ? 0 : expiration);

      if (expiration <= 0) {
        clearInterval(interval);

        setTimeout(onClose, 1000);
      }
    }, 1000);
  }, []);

  const title = expiration <= 0 ? 'Confirmed!' : 'Confirming...';
  const icon = expiration <= 0 ? <CheckIconStyled /> : <ClockIconStyled />;

  return (
    <Container>
      <Content>
        <LogoWrapperStyled icon={icon} />
        <TitleStyled>{title}</TitleStyled>

        <TextStyled>
          We batch all verifications for better privacy.{' '}
          <BoldText>
            You can safely close this window and return to the extension later.
          </BoldText>
          Your verification will be confirmed in:
        </TextStyled>

        <Timer>{msToTime(expiration)}</Timer>
      </Content>

      <Footer>
        <ButtonsContainer>
          <ButtonStyled appearance="action" onClick={onClose}>
            Close
          </ButtonStyled>

          <ButtonStyled onClick={onAction}>Add more verifications</ButtonStyled>
        </ButtonsContainer>
      </Footer>
    </Container>
  );
};

export default ScheduleOverlay;
