import TVerificationType from './verification-type'
import TVerificationStatus from './verification-status'

type TVerification = {
  verificationId: string
  verificationType: TVerificationType
  status: TVerificationStatus
  scheduledTime: number
  credentialGroupId: string
  batchId?: string | null
  txHash?: string
  fetched: boolean
}

export default TVerification