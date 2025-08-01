import React, { FC } from "react"
import TProps from './types'
import {
  Container,
  Title,
  Text,
  ImageContainer
} from './styled-components'
import { Icons } from '../../../components'

const NoVerificationsFound:FC<TProps> = ({
  className,
  title,
  text
}) => {
  return <Container className={className}>
    <ImageContainer>
      <Icons.PlusIcon />
    </ImageContainer>

    <Title>{title}</Title>
    <Text>
      {text}
    </Text>

  </Container>
}

export default NoVerificationsFound