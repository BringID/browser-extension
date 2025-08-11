import React, { FC } from 'react'
import styled from 'styled-components'

type TProps = {
  className?: string
}

const Svg = styled.svg`
  width: 32px;
  height: 32px;
`

const PlusIcon: FC<TProps> = ({
  className
}) => {
  return <Svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></Svg>
}

export default PlusIcon
