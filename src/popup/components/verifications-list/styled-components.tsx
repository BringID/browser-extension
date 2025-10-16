import styled from 'styled-components';
import { Button, Note, Link } from '../../../components';

export const ButtonStyled = styled(Button)`
  width: max-content;
  margin: 10px auto;
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const NoteStyled = styled(Note)`
  margin-bottom: 10px;
`;

export const LinkStyled = styled(Link)`
  text-decoration: underline;
`;
