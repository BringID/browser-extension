import React, { FC } from 'react';
import TProps from './types';
import {
  ButtonStyled,
  NoteStyled,
  NoteContent,
  TagStyled,
} from './styled-components';
import { TNotarizationStatus } from '../../common/types';

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

const Step: FC<TProps> = ({ text, currentStep, idx, progress, onClick }) => {
  const status: TNotarizationStatus = defineCurrentStep(idx, currentStep);

  return (
    <NoteStyled title={`Step ${idx + 1}`}>
      <NoteContent>
        {text}
        {status === 'completed' && (
          <TagStyled status="success">Done!</TagStyled>
        )}
      </NoteContent>

      {onClick && progress !== undefined && (
        <ButtonStyled
          size="small"
          appearance="action"
          onClick={onClick}
          disabled={progress < 100}
        >
          Continue ({progress}%)
        </ButtonStyled>
      )}
    </NoteStyled>
  );
};

export default Step;
