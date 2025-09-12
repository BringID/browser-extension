import { TNotarizationGroupCheck } from './notarization-group-check'

export type TNotarizationGroup = {
  points: number;
  semaphoreGroupId: string;
  credentialGroupId: string;
  checks?: TNotarizationGroupCheck[]
}