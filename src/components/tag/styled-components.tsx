import styled, { css } from "styled-components"
import { TStatus } from "./types"

export const Container = styled.div<{
  status: TStatus
}>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  line-height: 16px;
  background-color: ${props => props.theme.defaultStatusBackgroundColor};
  border: 1px solid ${props => props.theme.defaultStatusBorderColor};
  color: ${props => props.theme.primaryTextColor};
  font-size: 12px;
  font-weight: 500;

  ${props => props.status === 'info' && css`
    background-color: ${props => props.theme.infoStatusBackgroundColor};
    border: 1px solid ${props => props.theme.infoStatusBorderColor};
    color: ${props => props.theme.infoStatusTextColor};
  `}

  ${props => props.status === 'success' && css`
    background-color: ${props => props.theme.successStatusBackgroundColor};
    border: 1px solid ${props => props.theme.successStatusBorderColor};
    color: ${props => props.theme.successStatusTextColor};
  `}

    ${props => props.status === 'error' && css`
      background-color: ${props => props.theme.errorStatusBackgroundColor};
      border: 1px solid ${props => props.theme.errorStatusBorderColor};
      color: ${props => props.theme.errorStatusTextColor};
    `}


`
