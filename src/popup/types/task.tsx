import TTaskType from './task-type'
import TTaskStatus from './task-status'

type TTask = {
  taskId: string
  taskType: TTaskType
  status: TTaskStatus
  scheduledTime: number
  credentialGroupId: string
  batchId?: string | null
  txHash?: string
  fetched: boolean
}

export default TTask