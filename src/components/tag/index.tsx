import React, { FC } from 'react'
import { Container } from './styled-components'
import TProps from './types'

const Tag: FC<TProps> = ({
  children,
  className,
  status = 'default'
}) => {
  return <Container className={className} status={status}>
    {children}
  </Container>
}

export default Tag