import React, { FC } from 'react';
import { ProgressBarContainer, Bar, Titles, Title } from './styled-components';
import { TProps } from './types';
import { msToMinutes } from '../../side-panel/utils';

const defineTimeLeft = (resultReady: boolean, timeLeft?: number) => {
  if (timeLeft === undefined) {
    return 'Waiting...';
  }

  if (resultReady) {
    return 'Done';
  }

  if (timeLeft <= 0) {
    if (!resultReady) {
      return 'Almost done'
    }
    return 'Done';
  }

  return `~${msToMinutes(Math.round(timeLeft) * 1000)} left`;
};

const TimeLeftProgress: FC<TProps> = ({
  className,
  current,
  max,
  timeLeft,
  resultReady
}) => {
  const barValue = (current / max) * 100;
  const limeLeftValueText = defineTimeLeft(resultReady, timeLeft);

  return (
    <ProgressBarContainer className={className}>
      <Titles>
        <Title>{barValue.toFixed(2)}%</Title>
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
