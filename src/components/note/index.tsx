import TProps from './types'
import React, { FC } from 'react'
import {
  Container,
  Content,
  Title,
  ExclimationIcon
} from './styled-components'

const Note: FC<TProps> = ({
  children,
  className,
  status = 'default',
  title
}) => {
  return <Container
    className={className}
    status={status}
  >
    <ExclimationIcon />
    <Content>
      {title && <Title>{title}</Title>}
      {children}
    </Content>
  </Container>
}

export default Note