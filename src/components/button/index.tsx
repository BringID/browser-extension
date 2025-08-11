import React, { FC } from 'react'
import TProps from './types'
import { Button, SpinnerStyled } from './styled-components'

const ButtonComponent: FC<TProps> = ({
  children,
  onClick,
  className,
  size = 'default',
  disabled,
  appearance = 'default',
  loading
}) => {
  return <Button
    size={size}
    onClick={disabled ? undefined : onClick}
    className={className}
    disabled={disabled}
    loading={loading}
    appearance={appearance}
  >
    {loading && <SpinnerStyled />}
    {children}
  </Button>
}

export default ButtonComponent