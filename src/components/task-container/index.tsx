import React, {
  FC
} from "react"
import TProps from './types'
import {
  Container,
  Title,
  Subtitle,
  Content,
  ImageWrapper,
  Icon
} from './styled-components'
import DefaultPluginIcon from '../../assets/img/default-plugin-icon.png'

const TaskContainer: FC<TProps> = ({
  status,
  children,
  icon,
  title,
  description
}) => {

  return <Container status={status}>
    <ImageWrapper>
      <Icon src={icon || DefaultPluginIcon} />
    </ImageWrapper>
    <Content>
      <Title>{title}</Title>
      <Subtitle>{description}</Subtitle>
    </Content>
    {children}
  </Container>
}

export default TaskContainer