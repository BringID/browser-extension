import { TUserStatus } from "../types"
import app from "../configs"

type TDefineUserStatus = (verificationsFinished: number) => TUserStatus

const defineUserStatus: TDefineUserStatus = (
  points
) => {
  const diff = app.ADVANCED_STATUS_POINTS - points
  if (diff <= 0) {
    return 'advanced'
  }

  return 'basic'
}

export default defineUserStatus