import TProps from './types';
import React, { FC } from 'react';
import {
  Container,
  Content,
  Title
} from './styled-components';

const Note: FC<TProps> = ({
  children,
  className,
  status = 'default',
  title,
}) => {
  return (
    <Container className={className} status={status}>
      <Content>
        {title && <Title>{title}</Title>}
        {children}
      </Content>
    </Container>
  );
};

export default Note;
