import styled from 'styled-components';
import { Title, Button, Text } from '../../../components';

export const TitleStyled = styled(Title)``;

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 16px;
  border-bottom: 1px solid ${props => props.theme.primaryBorderColor};
  margin-bottom: 16px;
`;

export const UserStatus = styled.span`
  color: ${(props) => props.theme.successStatusTextColor};
  text-transform: capitalize;
`;


export const ButtonStyled = styled(Button)`
  margin-left: auto;
`

export const Content = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`

export const Texts = styled.div``

export const Address = styled.div`
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.theme.secondaryTextColor};
`

export const AddressText = styled.span`
  color: ${props => props.theme.primaryTextColor};
  font-weight: 700;
`
export const TextStyled = styled(Text)`
  font-size: 12px;
`