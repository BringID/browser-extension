import React, { FC } from 'react';
import TProps from './types';
import {
  NoteStyled,
  NoteContent,
  TagStyled,
  TimeLeftProgressStyled,
  Progress,
  Divider,
  Connection
} from './styled-components';
import { TNotarizationStatus } from '../../common/types';
import Icons from '../icons';
import { defineConnectionQualityIcon } from '../../side-panel/utils';

const defineCurrentStep = (
  idx: number,
  currentStep: number,
): TNotarizationStatus => {
  if (idx === currentStep) {
    return 'current';
  }

  if (idx < currentStep) {
    return 'completed';
  }

  return 'disabled';
};


const Step: FC<TProps> = ({
  text,
  currentStep,
  idx,
  progress,
  speed,
  connectionQuality,
  eta
 }) => {
  const status: TNotarizationStatus = defineCurrentStep(idx, currentStep);

  return (
    <NoteStyled title={`Step ${idx + 1}`}>
      <NoteContent>
        {text}
        {status === 'completed' && (
          <TagStyled status="success">Done!</TagStyled>
        )}
      </NoteContent>

      {progress !== undefined && <Progress>
        <TimeLeftProgressStyled
          max={100}
          current={progress}
          timeLeft={eta}
        />

        {connectionQuality && <Connection>
          {defineConnectionQualityIcon(connectionQuality)}
          <Divider>●</Divider>
          {speed}
        </Connection>}

      </Progress>}
    </NoteStyled>
  );
};

export default Step;
