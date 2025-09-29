import React, { FC, useState } from 'react'
import {
  Container,
  Content,
  Title,
  Arrow
} from './styled-components'
import TProps from './types'

const ExpandableContainer: FC<TProps> = ({
  title,
  children,
  className
}) => {
  const [ expanded, setExpanded ] = useState<boolean>(false)
  return <Container className={className}>
    <Title
      onClick={() => {
        setExpanded(!expanded)
      }}
    >
      <Arrow expanded={expanded}>🔽</Arrow>
      {title}
    </Title>
    <Content expanded={expanded}>
      {children}
    </Content>
  </Container>
}

export default ExpandableContainer