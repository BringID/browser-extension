import React, { FC, useState, useEffect } from 'react';
import {
  Container,
  LogoWrapperStyled,
  TitleStyled,
  Content,
  TextStyled,
  Image,
  Span,
} from './styled-components';
import TProps from './types';
import BringGif from '../../../images/bring.gif';

const TaskLoader: FC<TProps> = ({ onStart }) => {
  const [taskIsReady, setTaskIsReady] = useState<boolean>(false);
  useEffect(() => {
    setTimeout(() => {
      setTaskIsReady(true);
    }, 2000);
  }, []);

  return (
    <Container>
      <Content>
        <LogoWrapperStyled icon={<Image src={BringGif} />} />
        <TitleStyled>Verification will start soon</TitleStyled>

        <TextStyled>
          Verification will begin in a few seconds. If it doesn't start
          automatically,{' '}
          <Span
            onClick={() => {
              if (!taskIsReady) {
                return;
              }
              onStart();
            }}
          >
            click here to continue
          </Span>
        </TextStyled>
      </Content>
    </Container>
  );
};

export default TaskLoader;
