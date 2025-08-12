import React, { FC } from 'react';
import {
  ProgressBarContainer,
  Bar,
  Wrapper,
  Titles,
  Title,
} from './styled-components';
import { TProps } from './types';

const ProgressBar: FC<TProps> = ({ className, current, max, title, value }) => {
  const barValue = (current / max) * 100;
  return (
    <Wrapper>
      {title && value && (
        <Titles>
          <Title>{title}</Title>
          <Title>{value}</Title>
        </Titles>
      )}
      <ProgressBarContainer className={className}>
        <Bar
          style={{
            width: `${barValue}%`,
          }}
        />
      </ProgressBarContainer>
    </Wrapper>
  );
};

export default ProgressBar;
