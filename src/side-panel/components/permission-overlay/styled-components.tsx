import {
  Title,
  LogoWrapper,
  Text,
  Button,
  Note,
  Link,
  List
} from '../../../components';

import styled from 'styled-components';

export const Container = styled.div`
  padding: 12px;
  height: 100%;
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  z-index: 100;
  left: 0;
  background-color: ${(props) => props.theme.backgroundColor};
`;

export const TitleStyled = styled(Title)`
  text-align: center;
  font-size: 24px;
  margin-bottom: 8px;
`;

export const Header = styled.header`
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-bottom: 24px;
`;

export const Content = styled.div`
  padding: 24px;
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.secondaryBorderColor};
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
`;

export const Wrapper = styled.div`
  height: 100%;
`;

export const LogoWrapperStyled = styled(LogoWrapper)`
  margin-bottom: 12px;
  border-radius: 58px;
  width: 58px;
  height: 58px;
  padding: 5px;
`;

export const TextStyled = styled(Text)`
  text-align: center;
  font-size: 14px;
  margin-bottom: 40px;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
  flex-direction: column;
  width: 100%;
`;

export const ButtonStyled = styled(Button)`
`;

export const Image = styled.img`
  width: 48px;
  height: 48px;
  object-fit: contain;
  object-position: center;
`;

export const NoteStyled = styled(Note)`
  margin-bottom: 18px;
`;


export const LinkStyled = styled(Link)`
  color: ${props => props.theme.infoStatusTextColor};
  text-decoration: underline;
`

export const ListStyled = styled(List)`
  align-self: start;
  margin-bottom: 20px;
`