import styled from 'styled-components';

export const Container = styled.div`
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Title = styled.h3`
  font-size: 16px;
  line-height: 24px;
  margin: 0 0 16px;
  color: ${(props) => props.theme.secondaryTextColor};
  text-align: center;
`;
