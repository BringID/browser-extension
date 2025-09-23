import styled from 'styled-components';
import { Button } from '../../../components';

export const Container = styled.div`
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Title = styled.h3`
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  margin: 0;
  color: ${(props) => props.theme.secondaryTextColor};
  text-align: center;
`;

export const ButtonsStyled = styled(Button)`
  width: max-content;
  margin: 10px auto;
`;
