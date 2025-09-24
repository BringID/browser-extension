import styled from 'styled-components';
import { Note, Tag, TimeLeftProgress } from '..';

export const NoteStyled = styled(Note)``;

export const NoteContent = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

export const TagStyled = styled(Tag)``;

export const TimeLeftProgressStyled = styled(TimeLeftProgress)`
  margin: 10px 0;
`

export const Progress = styled.div`
  
`

export const Connection = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${props => props.theme.secondaryTextColor};
`

export const Divider = styled.span`
  font-size: 6px;
`