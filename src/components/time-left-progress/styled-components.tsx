import styled from 'styled-components';

export const ProgressBarContainer = styled.div`
  height: 24px;
  border-radius: 999px;
  overflow: hidden;
  position: relative;
  background: ${(props) => props.theme.blankColor};
`;

export const Bar = styled.div`
  position: absolute;
  top: 0;
  background: ${(props) => props.theme.primaryTextColor};
  left: 0;
  height: 100%;
`;

export const Titles = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 3px;
  position: absolute;
  height: 100%;
  inset: 0 10px;
  align-items: center;
`;

export const Title = styled.span`
  color: ${(props) => props.theme.backgroundColor};
  font-size: 12px;
  line-height: 24px;
  z-index: 2;
  position: relative;
  mix-blend-mode: difference;
`;
