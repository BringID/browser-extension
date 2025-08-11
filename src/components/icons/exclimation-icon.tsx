import React, { FC } from 'react'
import styled from 'styled-components'


type TProps = {
  className?: string
}

const Svg = styled.svg`
  width: 16px;
  height: 16px;
`

const ExclimationIcon: FC<TProps> = ({
  className
}) => {
  return <Svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></Svg>
}

export default ExclimationIcon
