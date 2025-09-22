import styled, { css } from 'styled-components';
import { TStatus } from './types';

export const LogoWrapper = styled.div<{
  status: TStatus;
}>`
  width: 58px;
  min-height: 58px;
  border: 1px solid ${(props) => props.theme.secondaryBorderColor};
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  ${(props) =>
    props.status === 'error' &&
    css`
      border: 1px solid ${(props) => props.theme.errorStatusBorderColor};
      background-color: ${(props) => props.theme.errorStatusBackgroundColor};
    `}
`;

export const Image = styled.img`
  min-width: 25px;
  max-width: 25px;
  height: 25px;
  display: block;
  object-fit: cover;
  object-position: center;
`;
