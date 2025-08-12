import styled from 'styled-components';

import { Icons, Title, Subtitle } from '../../../components';

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
