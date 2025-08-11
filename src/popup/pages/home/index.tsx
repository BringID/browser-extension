import React, { FC } from "react"
import manager from '../../manager'
import { useUser } from '../../store/reducers/user'
import {
  Container,
  ProgressBarStyled,
  SubtitleStyled,
  ButtonStyled
} from './styled-components'
import { Header } from '../../components'
import browser from 'webextension-polyfill'
import { TTask } from "../../types"
import { useNavigate } from 'react-router'

const Home: FC = () => {
  const user = useUser()
  console.log({ user })

  const percentageFinished = 0
  const leftForAdvanced = 20
  const tasks: TTask[] = []
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
      {tasks && tasks.length > 0 && <ButtonStyled
        size='small'
        onClick={() => {
          navigate('/plugins')
        }}
      >
        + Add
      </ButtonStyled>}
    </SubtitleStyled>

    {user.key}

    <ButtonStyled onClick={async () => {
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
    </ButtonStyled>
  </Container>
}

export default Home