import { TVerificationStatus } from "../../popup/types"

type TProps = {
  status: TVerificationStatus
  children: React.ReactNode | React.ReactNode[]
  icon?: string
  title: string
  description?: string
}

export default TProps