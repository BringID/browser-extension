import styled, { css } from "styled-components"
import TProps from "./types"
import Spinner from '../spinner'

export const Button = styled.button<TProps>`
  font-family: inherit;
  font-feature-settings: inherit;
  font-variation-settings: inherit;
  font-size: 100%;
  font-weight: inherit;
  line-height: inherit;
  letter-spacing: inherit;
  color: inherit;
  margin: 0;
  padding: 6px 12px;
  position: relative;
  font-size: 14px;
  cursor: pointer;
  height: 40px;
  line-height: 16px;
  font-weight: 500;
  border-radius: 6px;
  border: 1px solid ${props => props.theme && props.theme.primaryBorderColor};
  color: ${props => props.theme && props.theme.primaryTextColor};
  background-color: ${props => props.theme.backgroundColor};

  ${props => props.appearance === 'action' && css`
    background-color: ${props => props.theme.buttonActionBackgroundColor};
    border-color: ${props => props.theme.buttonActionBorderColor};
    color: ${props => props.theme.buttonActionTextColor};
  `}

  ${props => props.size === 'small' && css`
    height: 32px;
    font-size: 12px;
    padding: 4px 8px;
    line-height: 12px;
  `}

  ${props => props.disabled && css`
    opacity: .5;
    cursor: not-allowed;
    color: ${props => props.theme.additionalTextColor};
    background-color: ${props => props.theme.buttonDisabledBackgroundColor};
  `}


  ${(props) =>
    props.loading &&
    css`

      cursor: not-allowed;
      color: transparent!important;
      

      ${!props.disabled &&
      css`
        &:hover {
          background-position: right top;
        }
        &:active {
          background-position: center center;
          transform: scale(1.01);
        }
      `}
    `}
`

export const SpinnerStyled = styled(Spinner)`
  position: absolute;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
`