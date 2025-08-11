import React, { FC } from 'react'
import {
  SpinnerContainer
} from './styled-components'
import TProps from './types'

const Spinner: FC<TProps> = ({
  className
}) => {
  return <SpinnerContainer className={className} />
}

export default Spinner