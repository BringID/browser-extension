import React, { FC } from 'react';
import styled from 'styled-components';

type TProps = {
  className?: string;
};

const Svg = styled.svg`
  width: 24px;
  height: 24px;
`;

const BinanceIcon: FC<TProps> = ({ className }) => {
  return (
    <Svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <g clip-path="url(#clip0_7_30)">
        <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#F3BA2F"/>
        <path d="M9.48982 10.9687L12 8.45858L14.5101 10.9711L15.9703 9.51092L12 5.53827L8.02966 9.50858L9.48982 10.9687Z" fill="white"/>
        <path d="M5.53857 11.9988L6.99861 10.5387L8.4587 11.9988L6.99866 13.4589L5.53857 11.9988Z" fill="white"/>
        <path d="M9.48984 13.0313L12 15.5414L14.5102 13.0289L15.9727 14.4891H15.9703L12 18.4617L8.02969 14.4914L8.02734 14.4891L9.48984 13.0313Z" fill="white"/>
        <path d="M15.5408 12.0013L17.0008 10.5412L18.4609 12.0012L17.0009 13.4613L15.5408 12.0013Z" fill="white"/>
        <path d="M13.4812 12L12 10.5164L10.9054 11.6133L10.7789 11.7375L10.5187 11.9977L10.5164 12L10.5187 12.0024L12 13.4836L13.4812 12Z" fill="white"/>
        </g>
        <defs>
        <clipPath id="clip0_7_30">
        <rect width="24" height="24" fill="white"/>
        </clipPath>
        </defs>
    </Svg>
  );
};

export default BinanceIcon

