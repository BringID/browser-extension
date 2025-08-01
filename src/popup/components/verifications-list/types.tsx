import { TVerification } from "../../types"
import { Task } from "../../../common/task"

type TProps = {
  tasks: Task[]
  verifications: TVerification[]
  onAddVerifications: () => void
}

export default TProps