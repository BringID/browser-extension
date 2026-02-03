import styled from 'styled-components';
import {
  Spinner,
  Note,
  List,
} from '../../../components';

export const SpinnerStyled = styled(Spinner)`
  border-color: ${(props) => props.theme.primaryBorderColor};
`;

export const NoteStyled = styled(Note)``;

export const NoteAdditionalInfoStyled = styled(Note)`
  margin-bottom: 20px;
`;

export const ListStyled = styled(List)``;


export const NoteMarginStyled = styled(Note)`
  margin: 20px 0px 0;
  width: 100%;
`;

export const DownloadLogs = styled.span`
  color: ${props => props.theme.errorStatusTextColor};
  display: block;
  padding: 8px 0 0;
  border-top: 1px solid ${props => props.theme.errorStatusBorderColor};
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
`