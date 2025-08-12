import styled, { keyframes } from 'styled-components';

const rotationAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

export const SpinnerContainer = styled.span`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-block;
  border-top: 2px solid #fff;
  border-right: 2px solid transparent;
  box-sizing: border-box;
  animation: ${rotationAnimation} 1s linear infinite;
`;
