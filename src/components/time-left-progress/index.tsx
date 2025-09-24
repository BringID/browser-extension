import React, { FC } from 'react';
import {
  ProgressBarContainer,
  Bar,
  Titles,
  Title,
} from './styled-components'
import { TProps } from './types'
import { msToMinutes } from '../../popup/utils'

const TimeLeftProgress: FC<TProps> = ({ className, current, max, timeLeft }) => {
  const barValue = (current / max) * 100;
  const limeLeftValue = msToMinutes(timeLeft)
  return (
    <ProgressBarContainer className={className}>
      <Titles>
        <Title>{barValue}%</Title>
        <Title>~{limeLeftValue} left</Title>
      </Titles>
      <Bar
        style={{
          width: `${barValue}%`,
        }}
      />
    </ProgressBarContainer>
  );
};

export default TimeLeftProgress;
