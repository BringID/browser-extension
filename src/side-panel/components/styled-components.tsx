import styled from 'styled-components';
import {
  Title,
  LogoWrapper,
  Button,
  Text,
  Link,
} from '../../components'

export const Container = styled.div`
  border: 1px solid ${(props) => props.theme.secondaryBorderColor};
  border-radius: 8px;
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
`;

export const TitleStyled = styled(Title)`
  text-align: center;
`;

export const Header = styled.header`
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-bottom: 24px;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
`;

export const Wrapper = styled.div`
  height: 100%;
`;

export const LogoWrapperStyled = styled(LogoWrapper)`
  margin-bottom: 20px;
  img {
    object-fit: contain;
  }
`;


export const TextStyled = styled(Text)`
  text-align: center;
  margin-top: 10px;
`;

export const LinkStyled = styled(Link)`
  color: ${(props) => props.theme.infoStatusTextColor};
  text-decoration: underline;
`;

export const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: auto;
`;


export const ButtonStyled = styled(Button)`
  margin-top: 10px;
`;

/* ───── Home (idle / unauthenticated) styled components ───── */

export const HomeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding: 0 24px;
  overflow-y: auto;
`;

export const HomeLogoStyled = styled(LogoWrapper)`
  margin-top: 40px;
  margin-bottom: 20px;
  img {
    object-fit: contain;
  }
`;

export const HomeHeadline = styled.h1`
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
  margin: 0;
`;

export const HomeSubtext = styled.p`
  text-align: center;
  font-size: 14px;
  color: #6B7280;
  line-height: 1.5;
  max-width: 320px;
  margin: 8px auto 0;
`;

export const HomeCTAButton = styled.button`
  width: 100%;
  height: 48px;
  background: #1A1A1A;
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  margin-top: auto;
  padding: 0 24px;
  transition: background 0.2s, transform 0.15s;

  &:hover {
    background: #333333;
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const HomeFootnote = styled.p`
  text-align: center;
  font-size: 11px;
  color: #9CA3AF;
  margin: 12px 0 16px;
`;
