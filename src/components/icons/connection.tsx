import React, { FC } from 'react';
import styled from 'styled-components';

type TProps = {
  className?: string;
};

const Svg = styled.svg`
  width: 16px;
  height: 16px;
`;

const ConnectionIcon: FC<TProps> = ({ className }) => {
  return (
    <Svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="currentColor" d="M12 20h.01"></path>
      <path stroke="currentColor" d="M2 8.82a15 15 0 0 1 20 0"></path>
      <path stroke="currentColor" d="M5 12.859a10 10 0 0 1 14 0"></path>
      <path stroke="currentColor" d="M8.5 16.429a5 5 0 0 1 7 0"></path>
    </Svg>
  );
};

export default ConnectionIcon;
