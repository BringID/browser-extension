import React, {
  FC,
  useState,
  useEffect
} from "react"
import manager from '../../manager'
import { useUser } from '../../store/reducers/user'
import {
  Container,
  ProgressBarStyled,
  SubtitleStyled,
  ButtonStyled,
  MessageStyled,
  VerificationsListStyled
} from './styled-components'
import { Link } from '../../../components'
import { Header } from '../../components'
import browser from 'webextension-polyfill'
import { useNavigate } from 'react-router'
import { useVerifications } from "../../store/reducers/verifications"
import { tasks } from "../../../common/core/task"
import { ScheduleOverlay, ConfirmationOverlay } from "../../components"
import { calculateAvailablePoints } from "../../utils"
import configs from "../../configs"


const Home: FC = () => {
  const user = useUser()
  const verifications = useVerifications()
  const availableTasks = tasks()


  console.log('HOME: ', { verifications })
  const [
    confirmationOverlayShow,
    setConfirmationOverlayShow
  ] = useState<boolean>(false)
  const [
    timerOverlayShow,
    setTimerOverlayShow
  ] = useState<boolean>(false)
  const [
    requestHost,
    setRequestHost
  ] = useState<string>('')
  const [
    pointsRequired,
    setPointsRequired
  ] = useState<string>('')
  const [
    dropAddress,
    setDropAddress
  ] = useState<string>('')

  const [
    scheduledTime,
    setScheduledTime
  ] = useState<number | null>(null)

  const availablePoints = calculateAvailablePoints(verifications)
  const leftForAdvanced = configs.ADVANCED_STATUS_POINTS - availablePoints
  const percentageFinished = (availablePoints / configs.ADVANCED_STATUS_POINTS) * 100;

  const navigate = useNavigate()

  useEffect(() => {
    chrome.storage.local.get('request', (data) => {
      if (!data || !data.request) {
        return chrome.storage.local.set({ request: `` });
      }

      const [ host, pointsRequired, dropAddress ] =
        data.request.split(`__`);

      if (host && pointsRequired && dropAddress) {
        setDropAddress(dropAddress)
        setPointsRequired(pointsRequired)
        setRequestHost(host)
        setConfirmationOverlayShow(true)
      }

      chrome.storage.local.set({ request: null }, () => {
        console.log('request data deleted');
      })
    })
  }, [])

  useEffect(() => {
    if (!verifications) {
      return 
    }
    const findNotCompleted = verifications.find(verification => verification.status !== 'completed')
    console.log({
      verifications, findNotCompleted
    })
    if (findNotCompleted) {
      const now = +new Date()
      if (now >= findNotCompleted.scheduledTime) {
        return
      }

      setScheduledTime(findNotCompleted.scheduledTime)
      setTimerOverlayShow(true)
    } else {
      setScheduledTime(null)
      setTimerOverlayShow(false)
    }
  }, [
    verifications
  ])

  const onRequestClose = () => {
    setDropAddress('')
    setPointsRequired('')
    setRequestHost('')
    setConfirmationOverlayShow(false)
    window.close()
  };

  return <Container>
    {confirmationOverlayShow && (
      <ConfirmationOverlay
        onClose={() => {
          onRequestClose()
        }}
        host={requestHost}
        points={availablePoints}
        userStatus={user.status}
        pointsRequired={Number(pointsRequired)}
        dropAddress={dropAddress}
      />
    )}

    {!confirmationOverlayShow && timerOverlayShow && scheduledTime && <ScheduleOverlay
        onClose={() => {
          setScheduledTime(null)
          setTimerOverlayShow(false)
        }}
        scheduledTime={scheduledTime}
      />}

    <Header status={user.status} points={availablePoints} />
  
    <ProgressBarStyled
      current={percentageFinished > 100 ? 100 : percentageFinished}
      max={100}
      title={`${leftForAdvanced < 0 ? 0 : leftForAdvanced} points more to Advanced`}
      value={`${Math.round(percentageFinished > 100 ? 100 : percentageFinished)}%`}
    />

    <SubtitleStyled>
      Your verifications
      {verifications && verifications.length > 0 && <ButtonStyled
        size='small'
        onClick={() => {
          navigate('/tasks')
        }}
      >
        + Add
      </ButtonStyled>}
    </SubtitleStyled>

    {verifications && verifications.length > 0 && <MessageStyled>
      Verifications are batched for better privacy. <Link href="#">Learn more</Link>
    </MessageStyled>}



    <VerificationsListStyled
      tasks={availableTasks}
      verifications={verifications}
      onAddVerifications={() => {
        navigate('/tasks')
      }}
    />

    {/* {user.key} */}

    {/* <ButtonStyled onClick={async () => {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true
      })
      // @ts-ignore
      chrome.sidePanel.open({
        tabId: tab.id
      })
    }}>
      open sidebar
    </ButtonStyled>

    <ButtonStyled onClick={async () => {
      const response = await browser.runtime.sendMessage({
        type: 'VERIFICATION_START'
      })
    }}>
      Send message to sidebar
    </ButtonStyled>

    <ButtonStyled appearance='action'
      onClick={() => {
        if (user.id) {
          manager.addUserKey(
            user.id,
            String(+new Date())
          )
        }

      }}
    >
      AddKey
    </ButtonStyled> */}
  </Container>
}

export default Home