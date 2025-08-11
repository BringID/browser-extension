import React, { FC } from 'react'
import styled from 'styled-components'

type TProps = {
  className?: string
}

const Svg = styled.svg`
  width: 16px;
  height: 16px;
`

const SpinnerIcon: FC<TProps> = ({
  className
}) => {
  return <Svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></Svg>
}

export default SpinnerIcon
