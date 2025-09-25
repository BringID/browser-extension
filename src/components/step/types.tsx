import { TConnectionQuality } from "../../popup/types";

type TProps = {
  text: string;
  idx: number;
  currentStep: number;
  progress?: number; // percentage

  latency: number; // ms
  bandwidth: number; // bits per second
  connectionQuality: TConnectionQuality

};

export default TProps;
