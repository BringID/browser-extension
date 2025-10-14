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

export const Span = styled.span`
  text-decoration: underline;
  cursor: pointer;
`;

export const Image = styled.img`
  width: 58px;
  height: 58px;
  object-fit: cover;
  object-position: center;
`;
