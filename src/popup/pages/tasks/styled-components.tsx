import styled from 'styled-components';

import { Icons, Title, Subtitle, Text, Link } from '../../../components';

export const Container = styled.div``;

export const TitleStyled = styled(Title)`
  margin-bottom: 5px;
`;

export const SubtitleStyled = styled(Subtitle)`
  margin: 0;
`;

export const Header = styled.header`
  padding: 24px;
  display: flex;
  align-items: center;
  color: ${(props) => props.theme.primaryTextColor};
  gap: 12px;
`;

export const HeaderContent = styled.div``;

export const Content = styled.div`
  padding: 20px;
`;

export const ArrowBackIconStyled = styled(Icons.ArrowBackIcon)`
  cursor: pointer;
`;

export const TextStyled = styled(Text)`
  text-align: center;
  font-size: 12px;
  padding: 0 12px;
`;

export const LinkStyled = styled(Link)`
  font-size: 12px;
  color: ${(props) => props.theme.secondaryTextColor};
  text-decoration: underline;
`;
