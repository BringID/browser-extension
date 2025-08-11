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
import {
  TaskContainer
} from "../../components"
import Button from '../button'
import manager from "../../popup/manager"
import semaphore from "../../popup/semaphore"
import configs from "../../popup/configs"

import getStorage from "../../popup/db-storage"

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
    status='default'
    selectable={false}
    title={title}
    description={description}
    icon={icon}
    id={taskId}
  >
    <Value>
      <Button
        appearance="action"
        size='small'
        onClick={async () => {
          const storage = await getStorage()
          const userKey = await storage.getUserKey()

          if (!userKey) {
             chrome.tabs.create({
              url: configs.CONNECT_WALLET_URL
            })
            return
          }
          const data = await manager.runTask(taskId)
          console.log({ data })
          const verify = await manager.runVerify(
            data,
            taskId
          )
          console.log({ verify })

          if (verify) {
            const verification = await manager.saveVerification(
              verify,
              taskId
            )

            console.log({
              verification
            })
          }

        }}
      >
        Verify
      </Button>
    </Value>
  </TaskContainer>
}

export default Task