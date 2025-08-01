import styled, {
  css
} from "styled-components"

import { TMessageStatus } from './types'

export const Container = styled.div<{
  status: TMessageStatus
}>`
  padding: 16px;
  border: 1px solid ${props => props.theme.primaryBorderColor};
  border-radius: 8px;
  background-color: ${props => props.theme.messageBackgroundColor};
  width: 100%;
  font-size: 14px;

  ${props => props.status === 'error' && css`
    background-color: ${props => props.theme.errorStatusBackgroundColor};
    border: 1px solid ${props => props.theme.errorStatusBorderColor};
    color: ${props => props.theme.errorStatusTextColor};
  `}

  ${props => props.status === 'warning' && css`
    background-color: ${props => props.theme.warningStatusBackgroundColor};
    border: 1px solid ${props => props.theme.warningStatusBorderColor};
    color: ${props => props.theme.warningStatusTextColor};
  `}
`