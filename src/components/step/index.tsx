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
import { defineConnectionQualityIcon, formatBandwidth } from '../../popup/utils';

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
  latency,
  bandwidth,
  connectionQuality
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
          timeLeft={180000}
        />


        <Connection>
          {defineConnectionQualityIcon(connectionQuality)}
          {' '}
          {latency}ms
          <Divider>●</Divider>
          {formatBandwidth(bandwidth)}
        </Connection>

      </Progress>}
    </NoteStyled>
  );
};

export default Step;
