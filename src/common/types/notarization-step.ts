
import { TNotarizationStatus } from './notarization-status'

export type TNotarizationStep = {
  status: TNotarizationStatus,
  text: string
  notarization?: boolean
}