import TProps from './types';
import React, { FC } from 'react';
import { Container, Content, Title, ExclimationIconStyled } from './styled-components';

const Note: FC<TProps> = ({
  children,
  className,
  status = 'default',
  title,
}) => {
  const icon = status === 'warning' || status === 'error' ? <ExclimationIconStyled /> : null
  return (
    <Container className={className} status={status}>
      {icon}
      <Content>
        {title && <Title>{title}</Title>}
        {children}
      </Content>
    </Container>
  );
};

export default Note;
