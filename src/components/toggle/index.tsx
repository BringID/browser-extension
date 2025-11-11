import React, { FC } from 'react'
import { TProps } from './types'
import { ToggleContainer, ToggleItem, ToggleLabel, ToggleSwitcher } from './styled-components'

const Toggle: FC<TProps> = ({ label, disabled, value, onChange, className, size = 'default' }) => {
  return (
    <ToggleContainer className={className}>
      <ToggleItem
        size={size}
        value={value}
        disabled={disabled}
        onClick={() => !disabled && onChange && onChange(!value)}
      >
        <ToggleSwitcher value={value} size={size} disabled={disabled} />
      </ToggleItem>
      {label && <ToggleLabel>{label}</ToggleLabel>}
    </ToggleContainer>
  )
}

export default Toggle
