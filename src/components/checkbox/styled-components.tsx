import styled, { css } from 'styled-components';

export const Container = styled.div`
  display: flex;
  align-items: center;
  text-align: left;
  cursor: pointer;
`;

export const Checkbox = styled.div<{ checked: boolean }>`
  display: flex;
  align-items: center;
  min-width: 16px;
  justify-content: center;
  height: 16px;
  border-radius: 4px;
  background-color: ${(props) => props.theme.primaryBorderColor};

  ${(props) =>
    props.checked &&
    css`
      background-color: ${props.theme.buttonActionBackgroundColor};
    `}
`;

export const Title = styled.h3`
  font-size: 12px;
  font-weight: 400;
  margin: 0 0 0 6px;
`;
