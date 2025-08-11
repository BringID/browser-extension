import React, { FC } from 'react'
import styled from 'styled-components'

type TProps = {
  className?: string
}

const Svg = styled.svg`
  width: 16px;
  height: 16px;
  color: ${props => props.theme.successStatusTextColor};
`

const CheckIcon: FC<TProps> = ({
  className
}) => {
  return <Svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></Svg>
}

export default CheckIcon
  