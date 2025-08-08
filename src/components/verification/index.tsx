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
import { Icons } from "../../components"
import { Button } from "../../components"
import { msToTime } from "../../popup/utils"
import { Tag } from "../../components"
import { useDispatch } from "react-redux"
import getStorage from "../../popup/db-storage"

const definePluginContent = (
  status: TVerificationStatus,
  points: number,
  expiration: null | number,
  fetched: boolean,
  onCheckTransactionClick?: () => void
) => {
  switch (status) {
    case 'default':
      return <Tag status='default'>{points} pts</Tag>
    case 'pending':
      return <Icons.Clock />
    case 'scheduled':
      return <>
        <Icons.Clock />
        {msToTime(expiration || 0)} left
      </>

    case 'completed': 
      if (fetched) {
        return null
      }
      return <Button
        onClick={onCheckTransactionClick}
        size='small'
      >
        Check TX
      </Button>
    
    default:
      return <Icons.Check />
  } 
}

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


const Verification: FC<TProps> = ({
  title,
  taskId,
  points,
  icon,
  description,
  scheduledTime,
  status,
  selectable,
  selected,
  onSelect
}) => {


  const [ expiration, setExpiration ] = useState<number | null>(null)
  const [ fetched, setFetched ] = useState<boolean>(false)

  useEffect(() => {
    const interval = window.setInterval(async () => {
      const now = +new Date()
      const expiration = scheduledTime - now
      setExpiration(expiration)
      console.log({ expiration })
      if ((expiration) <= 0 ) {
        window.clearInterval(interval)
        const storage = await getStorage()
        await storage.updateVerificationStatus(
          taskId,
          'completed'
        )
        
      }
    }, 1000)

    return () => {
      window.clearInterval(interval)
    }
  }, [
    
  ])

  const content = definePluginContent(
    status as TVerificationStatus,
    points,
    expiration,
    fetched,
    async () => {
      alert('CHECK TXHASH')

      // chrome.tabs.create({
      //   url: `${defineExplorerURL(84532)}/tx/${tx_hash}`
      // })
    }
  )

  return <TaskContainer
    status={status}
    selectable={selectable}
    title={title}
    description={description}
    icon={icon}
    selected={selected}
    onSelect={onSelect}
    id={taskId}
  >
    <Value>
      {content}
    </Value>
  </TaskContainer>
}

export default Verification