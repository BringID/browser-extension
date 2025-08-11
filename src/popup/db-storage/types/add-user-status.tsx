import { TUserStatus } from "../../types"

type TAddUserStatus = (
  status: TUserStatus
) => Promise<string | void>

export default TAddUserStatus