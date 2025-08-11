import React, { FC } from "react"
import TProps from "./types"
import { Container } from './styled-components'

const Text: FC<TProps> = ({
  children,
  className
}) => {
  return <Container className={className}>
    {children}
  </Container>
} 

export default Text