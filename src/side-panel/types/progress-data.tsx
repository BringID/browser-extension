import { TConnectionQuality } from '../../common/types';

type TProgressData = {
  progress: number;
  eta: string;
  etaSeconds: number;
  speed: string;
  throughput: number;
  quality: TConnectionQuality;
  totalBytes: number;
  remainingBytes: number;
  elapsedSeconds: number;
};

export default TProgressData;
