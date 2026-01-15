import {
  Title,
  LogoWrapper,
  Text,
  Message,
  Button,
  Note,
} from '../../../components';

import styled from 'styled-components';

export const Container = styled.div`
  padding: 12px;
  height: 100%;
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  z-index: 1;
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
`;

export const TextStyled = styled(Text)`
  text-align: center;
  font-size: 14px;
  margin-bottom: 40px;
`;

export const MessageStyled = styled(Message)`
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
`;

export const ButtonStyled = styled(Button)`
  flex: 1;
`;

export const Image = styled.img`
  width: 58px;
  height: 58px;
  object-fit: cover;
  object-position: center;
`;

export const NoteStyled = styled(Note)`
  margin-bottom: 18px;
`;

export const OpenPopupButton = styled.span`
  text-decoration: underline;
  cursor: pointer;
`;

export const UserStatusRequired = styled.span`
  color: ${(props) => props.theme.errorStatusTextColor};
  text-transform: capitalize;
`;

export const UserStatus = styled.span`
  color: ${(props) => props.theme.successStatusTextColor};
  text-transform: capitalize;
`;
