import React, { FC } from 'react'
import TProps from './types'
import { SubtitleComponent } from './styled-components'

const Subtitle: FC<TProps> = ({
  children,
  className
}) => {
  return <SubtitleComponent className={className}>{children}</SubtitleComponent>
}

export default Subtitle