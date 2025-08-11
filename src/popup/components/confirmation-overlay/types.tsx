import { TUserStatus } from "../../types"

type TProps = {
  host: string
  address: string
  pointsNeeded: number
  dropAddress: string
  privateKey: string
  onClose: () => void
  points: number
  userStatus: TUserStatus
}

export default TProps