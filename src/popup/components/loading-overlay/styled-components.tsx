import { Title, Spinner } from '../../../components';

import styled from 'styled-components';

export const Container = styled.div`
  padding: 12px;
  height: 100%;
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  z-index: 1;
  left: 0;
  background-color: ${(props) => props.theme.overlayBackgroundColor};
`;

export const TitleStyled = styled(Title)`
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
`;

export const Content = styled.div`
  padding: 24px;
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.secondaryBorderColor};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

export const Wrapper = styled.div`
  height: 100%;
`;

export const SpinnerStyled = styled(Spinner)`
  margin: 0 auto;
  border-color: ${(props) => props.theme.primaryTextColor};
`;
