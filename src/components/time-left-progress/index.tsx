import React, { FC } from 'react';
import {
  ProgressBarContainer,
  Bar,
  Titles,
  Title,
} from './styled-components'
import { TProps } from './types'
import { msToMinutes } from '../../side-panel/utils'

const defineTimeLeft = (
  timeLeft?: number
) => {

  if (timeLeft === undefined)  {
    return  'Waiting...'
  }

  if (timeLeft <= 0) {
    return 'Done'
  }

  return `~${msToMinutes(Math.round(timeLeft) * 1000)} left`
}

const TimeLeftProgress: FC<TProps> = ({ className, current, max, timeLeft }) => {
  const barValue = (current / max) * 100;
  const limeLeftValueText = defineTimeLeft(timeLeft)

  return (
    <ProgressBarContainer className={className}>
      <Titles>
        <Title>{barValue}%</Title>
        <Title>{limeLeftValueText}</Title>
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
