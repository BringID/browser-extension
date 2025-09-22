import styled from 'styled-components';
import { Title, LogoWrapper, Spinner, Button, Note, Text, List, Link } from '../components';

export const Container = styled.div`
  border: 1px solid ${(props) => props.theme.secondaryBorderColor};
  border-radius: 8px;
  padding: 24px;
  height: 100%;
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


export const SpinnerStyled = styled(Spinner)`
  border-color: ${(props) => props.theme.primaryBorderColor};
`;

export const ButtonStyled = styled(Button)`
  margin-top: 10px;
`;

export const NoteStyled = styled(Note)`
`;


export const TextStyled = styled(Text)`
  text-align: center;
  margin-top: 10px;
`

export const ListStyled = styled(List)``

export const LinkStyled = styled(Link)`
  color: ${props => props.theme.infoStatusTextColor};
`

export const Buttons = styled.div`
  display: flex;
  flex-direction: column;
`