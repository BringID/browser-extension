import styled, { css } from 'styled-components';

export const Container = styled.div``;

export const Title = styled.h4`
  color: ${(props) => props.theme.secondaryTextColor};
  font-size: 12px;
  margin: 0;
  font-weight: 400;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const Content = styled.div<{
  expanded: boolean;
}>`
  padding: 12px 0 0;
  display: none;

  ${(props) =>
    props.expanded &&
    css`
      display: block;
    `}
`;

export const Arrow = styled.span<{
  expanded: boolean;
}>`
  transition: rotate 0.3s;
  ${(props) =>
    props.expanded &&
    css`
      rotate: 90deg;
    `}
`;
