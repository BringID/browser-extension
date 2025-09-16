import styled, { css } from 'styled-components';
import { TVerificationStatus } from '../../popup/types';
import Checkbox from '../checkbox';

export const Container = styled.div<{
  status: TVerificationStatus;
}>`
  padding: 12px;
  border-radius: 8px;
  
  background-color: ${(props) => props.theme.defaultStatusBackgroundColor};
  border: 1px solid ${(props) => props.theme.defaultStatusBorderColor};

  ${(props) =>
    props.status === 'completed' &&
    css`
      background-color: ${(props) => props.theme.successStatusBackgroundColor};
      border: 1px solid ${(props) => props.theme.successStatusBorderColor};
    `}

  ${(props) =>
    (props.status === 'pending' || props.status === 'scheduled') &&
    css`
      background-color: ${(props) => props.theme.pendingStatusBackgroundColor};
      border: 1px solid ${(props) => props.theme.pendingStatusBorderColor};
    `}
`;

export const CheckboxStyled = styled(Checkbox)``;

export const Title = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: ${(props) => props.theme.primaryTextColor};
  margin: 0;
`;

export const Subtitle = styled.h4`
  font-size: 12px;
  font-weight: 400;
  color: ${(props) => props.theme.secondaryTextColor};
  margin: 0;
`;

export const Icon = styled.img`
  width: 16px;
  height: 16px;
  display: block;
  object-fit: cover;
  object-position: center;
`;

export const ImageWrapper = styled.div`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => props.theme.backgroundColor};
  border: 1px solid ${(props) => props.theme.primaryBorderColor};
  border-radius: 6px;
`;

export const Content = styled.div``;


export const Tiers = styled.ul`
  margin: 4px 0 0;
  padding: 0 0 0 10px;
`

export const Tier = styled.li`
  
`

export const Body = styled.div<{
  selectable: boolean;
}>`
  display: grid;
  grid-template-columns: 30px 1fr max-content;
  gap: 10px;
  align-items: center;

  ${(props) =>
    props.selectable &&
    css`
      grid-template-columns: min-content 30px 1fr max-content;
    `}

`

export const Footer = styled.div`
  color: ${(props) => props.theme.secondaryTextColor};
  padding-top: 10px;
  padding-left: 40px;

`