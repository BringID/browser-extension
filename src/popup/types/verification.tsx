import TVerificationStatus from './verification-status'

type TVerification = {
  status: TVerificationStatus
  scheduledTime: number
  credentialGroupId: string
  batchId?: string | null
  txHash?: string
  fetched: boolean
}

export default TVerification