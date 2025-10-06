import { TConnectionQuality } from '../../common/types';

type TProps = {
  text: string;
  idx: number;
  currentStep: number;
  progress?: number; // percentage
  result?: string;
  speed?: string; // bits per second
  connectionQuality?: TConnectionQuality;
  eta?: number;
};

export default TProps;
