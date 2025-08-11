import React, { FC } from 'react'
import TProps from './types'
import { TitleComponent } from './styled-components'

const Title: FC<TProps> = ({
  children,
  className
}) => {
  return <TitleComponent className={className}>{children}</TitleComponent>
}

export default Title