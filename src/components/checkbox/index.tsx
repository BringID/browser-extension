import React, { FC } from 'react'
import TProps from './types'
import {
  Container,
  Title,
  Checkbox
} from './styled-components'
import Icons from '../icons'

const CheckboxComponent: FC<TProps> = ({
  title,
  checked,
  onClick,
  disabled,
  className
}) => {
  return <Container className={className}>
    <Checkbox
      checked={checked}
      onClick={() => {
        if (disabled) { return }
        onClick && onClick(!checked)
      }}
    >
      {checked && <Icons.Check />}
    </Checkbox>
    {title && <Title>{title}</Title>}
  </Container>
}

export default CheckboxComponent