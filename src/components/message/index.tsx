import React, { FC } from "react"
import TProps from './types'
import { Container } from './styled-components'

const Message: FC<TProps>  = ({
  children,
  className,
  status = 'default'
}) => {
  return <Container
    className={className}
    status={status}
  >
    {children}
  </Container>
}

export default Message
