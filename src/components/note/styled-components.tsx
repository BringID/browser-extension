import styled, { css } from 'styled-components';
import { TNoteStatus } from './types';
import ExclimationIcon from '../icons/exclimation-icon';


export const Container = styled.div<{
  status: TNoteStatus;
}>`
  padding: 16px;
  border-radius: 8px;
  font-size: 14px;
  background-color: ${(props) => props.theme.messageBackgroundColor};
  border: 1px solid ${(props) => props.theme.primaryBorderColor};
  color: ${(props) => props.theme.primaryTextColor};
  display: flex;
  svg {
    stroke: ${(props) => props.theme.primaryTextColor};
  }

  ${(props) =>
    props.status === 'error' &&
    css`
      background-color: ${(props) => props.theme.errorStatusBackgroundColor};
      border: 1px solid ${(props) => props.theme.errorStatusBorderColor};
      color: ${(props) => props.theme.errorStatusTextColor};
    `}

  ${(props) =>
    props.status === 'info' &&
    css`
      background-color: ${(props) => props.theme.infoStatusBackgroundColor};
      border: 1px solid ${(props) => props.theme.infoStatusBorderColor};
      color: ${(props) => props.theme.infoStatusTextColor};
    `}

  ${(props) =>
    props.status === 'warning' &&
    css`
      background-color: ${(props) => props.theme.warningStatusBackgroundColor};
      border: 1px solid ${(props) => props.theme.warningStatusBorderColor};
      color: ${(props) => props.theme.warningStatusTextColor};

      svg {
        stroke: ${(props) => props.theme.warningStatusTextColor};
        path {
          stroke: ${(props) => props.theme.warningStatusTextColor};
        }
      }
    `}
`;

export const Content = styled.div`
  font-size: 12px;
  flex: 1;
`;

export const Title = styled.h4`
  font-size: 14px;
  margin: 0 0 4px;
`;


export const ExclimationIconStyled = styled(ExclimationIcon)`
  margin-right: 6px;
`