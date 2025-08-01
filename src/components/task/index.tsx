import React, {
  FC,
  useEffect,
  useState
} from "react"
import { TProps } from './types'
import {
  Value
} from './styled-components'
import {
  TVerificationStatus
} from '../../popup/types'
import { TaskContainer } from "../../components"


// const definePluginContent = (
//   status: TPluginStatus,
//   expiration: null | number,
//   fetched: boolean,
//   onCheckTransactionClick?: () => void
// ) => {
//   switch (status) {
//     case 'pending':
//       return <Icons.Clock />
//     case 'scheduled':
//       return <>
//         <Icons.Clock />
//         {/* {msToTime(expiration || 0)} left */}
//       </>

//     case 'completed': 
//       if (fetched) {
//         return null
//       }
//       return <Button onClick={onCheckTransactionClick}>
//         Check TX
//       </Button>
    
//     default:
//       return <Icons.Check />
//   } 
// }

// const defineVerificationStatus = (
//   config: PluginConfig | null,
//   task?: TTask
// ) => {
//   if (!task || !config) {
//     return {
//       status: 'default',
//       data: null
//     }
//   }

//   if (task) {
//     if (task.scheduledTime > +new Date()) {
//       return {
//         status: 'scheduled',
//         data: task.scheduledTime
//       }
//     } else {
//       return {
//         status: 'completed',
//         data: task.scheduledTime
//       }
//     }
//   } else {
//     return {
//       status: "default",
//       data: null
//     }
//   }
// }


const Task: FC<TProps> = ({
  title,
  taskId,
  points,
  icon,
  description
}) => {

  const [ status, setStatus ] = useState<TVerificationStatus | null>('default')
  const [ scheduledTime, setScheduledTime ] = useState<number | null>(null)
  const [ expiration, setExpiration ] = useState<number | null>(null)
  const [ fetched, setFetched ] = useState<boolean>(false)

  // useEffect(() => {
  //   if (!tasks || tasks.length === 0) {
  //     return
  //   }

  //   const relatedTask = findRelatedTask(
  //     config as TPluginObject,
  //     tasks
  //   )

  //   const { status, data } = defineVerificationStatus(
  //     config,
  //     relatedTask
  //   )

  //   setFetched(Boolean(relatedTask?.fetched))

  //   setStatus(Boolean(relatedTask?.fetched) ? 'completed' : status as TPluginStatus)

  //   if (data) {
  //     setScheduledTime(data)
  //   }
  // }, [
  //   tasks
  // ])


  // if ((status !== 'scheduled' && status !== 'pending' && status !== 'completed')) {
  //   return null
  // }

  // const content = definePluginContent(
  //   status as TPluginStatus,
  //   expiration,
  //   fetched,
  //   async () => {
  //     const relatedTask = findRelatedTask(
  //       config as TPluginObject,
  //       tasks
  //     )

  //     if (relatedTask) {
  //       const data = await taskManagerApi.getTask(relatedTask.taskId)
  //       const {
  //         tx_hash
  //       } = data.task

  //       chrome.tabs.create({
  //         url: `${defineExplorerURL(84532)}/tx/${tx_hash}`
  //       })
  //     }
  //   }
  // )

  return <TaskContainer
    status={'default'}
    title={title}
    description={description}
    icon={icon}
  >
    <Value>
      {/* {content} */}
    </Value>
  </TaskContainer>
}

export default Task