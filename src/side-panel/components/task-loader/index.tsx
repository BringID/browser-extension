import React, { FC, useState, useEffect } from 'react';
import {
  Container,
  LogoWrapperStyled,
  TitleStyled,
  Content,
  TextStyled,
  Image,
  ButtonStyled,
} from './styled-components'
import TProps from './types'
import BringGif from '../../../images/bring.gif';


const TaskLoader: FC<TProps> = ({
  onStart
}) => {
  const [taskIsReady, setTaskIsReady] = useState<boolean>(false);
  useEffect(() => {
    setTimeout(() => {
      setTaskIsReady(true)
    }, 2000)
  }, [])

  return (
    <Container>
      <Content>
        <LogoWrapperStyled icon={<Image src={BringGif} />} />
        <TitleStyled>Verification will start soon</TitleStyled>

        <TextStyled>
          Verification will begin in a few seconds. If it doesn't start automatically, click the button below.
        </TextStyled>
   
        <ButtonStyled
          size="default"
          appearance='action'
          disabled={!taskIsReady}
          onClick={onStart}
        >
          Start manually
        </ButtonStyled>
      </Content>
    </Container>
  );
};

export default TaskLoader;
