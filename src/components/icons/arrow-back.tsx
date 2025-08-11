import React, { FC } from 'react'
import styled from 'styled-components'

type TProps = {
  className?: string
  onClick?: () => void
}

const Svg = styled.svg`
  width: 16px;
  height: 16px;
  color: ${props => props.theme.primaryTextColor};
`

const ArrowBackIcon: FC<TProps> = ({
  className,
  onClick
}) => {
  return <Svg onClick={onClick} className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></Svg>
}


export default ArrowBackIcon
  