import styled from 'styled-components';
import { Title, ProgressBar, Subtitle, Button } from '../../../components';

export const TitleStyled = styled(Title)``;

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 16px;
`;

export const UserStatus = styled.span`
  color: ${(props) => props.theme.successStatusTextColor};
  text-transform: capitalize;
`;
