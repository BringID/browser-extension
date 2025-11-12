import styled, { css } from 'styled-components'
import { TSize } from './types'

type TProps = { value: boolean; size: TSize; disabled?: boolean }

export const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
`

export const ToggleItem = styled.div<TProps>`
  border-radius: 35px;
  height: 31px;
  width: 51px;
  align-items: center;
  position: relative;
  padding: 2px;
  box-sizing: border-box;
  cursor: pointer;
  background-color: ${(props) => (props.theme && props.theme.additionalBorderColor)};
  transition: background-color 0.3s;
  ${(props) =>
    props.value &&
    css`
      background-color: ${(props) =>
        (props.theme && props.theme.highlightColor)};
    `}

  ${(props) =>
    props.disabled &&
    css`
      opacity: .6;
      cursor: not-allowed;
    `}
  
  ${(props) =>
    props.size === 'small' &&
    css`
      height: 16px;
      width: 26px;
    `}
`

export const ToggleLabel = styled.h4`
  font-weight: 600;
  font-size: 16px;
  margin: 0 0 0 12px;
  color: ${(props) => (props.theme && props.theme.primaryTextColor)};
`

export const ToggleSwitcher = styled.div<TProps>`
  width: 27px;
  height: 27px;
  position: absolute;
  top: 2px;
  left: 2px;
  border-radius: ${(props) => (props.size === 'default' ? '27px' : '12px')};
  transition: left 0.3s, background-color 0.3s;
  background-color: ${(props) =>
    (props.theme && props.theme.secondaryBorderColor)};
  ${(props) =>
    props.value &&
    css`
      left: calc(100% - ${props.size === 'default' ? '29px' : '14px'});
    `}

  ${(props) =>
    props.disabled &&
    css`
      cursor: not-allowed;
      background-color: ${(props) =>
        (props.theme && props.theme.buttonDisabledBackgroundColor)};
    `}

  ${(props) =>
    props.size === 'small' &&
    css`
      width: 12px;
      height: 12px;
    `}
`
