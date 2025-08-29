import styled from 'styled-components';

export const TitleComponent = styled.h1`
  font-size: 16px;
  margin: 0;
  font-weight: 700;
  color: ${(props) => props.theme.primaryTextColor};
`;
