import React, { FC } from "react"
import manager from '../../manager'
import { useUser } from '../../store/reducers/user'
import {
  Container,
  ProgressBarStyled,
  SubtitleStyled,
  ButtonStyled,
  MessageStyled
} from './styled-components'
import { Link } from '../../../components'
import { Header } from '../../components'
import browser from 'webextension-polyfill'
import { TVerificationType } from "../../types"
import { useNavigate } from 'react-router'
import { useVerifications } from "../../store/reducers/verifications"
import { VerificationsList } from "../../components"
import tasks from "../../../common/task"

const Home: FC = () => {
  const user = useUser()
  const verifications = useVerifications()
  const availableTasks = tasks()
  console.log({ user })


  const percentageFinished = 0
  const leftForAdvanced = 20
  const navigate = useNavigate()

  return <Container>
    <Header status={user.status} points={10} />
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



    <VerificationsList
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