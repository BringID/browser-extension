import React, {
  FC,
  useState,
  useEffect
} from "react"
import {
  Container,
  LogoWrapperStyled,
  TitleStyled,
  Content,
  ButtonsContainer,
  MessageStyled,
  TextStyled,
  Image,
  ButtonStyled,
  NoteStyled,
  OpenPopupButton,
  UserStatusRequired,
  UserStatus
} from './styled-components'
import TProps from "./types"
import {
  defineUserStatus
} from '../../utils'
import { Tag } from '../../../components'
import BringGif from './bring.gif'
import {
  TExtensionRequestType,
  TWebsiteRequestType
} from "../../types"
import browser from 'webextension-polyfill'

const ConfirmationOverlay: FC<TProps> = ({
  onClose,
  address,
  dropAddress,
  pointsNeeded,
  host,
  points,
  userStatus,
  privateKey
}) => {
  const [ loading, setLoading ] = useState<boolean>(false)
  const isEnoughPoints = points >= pointsNeeded
  const requiredStatus = defineUserStatus(pointsNeeded)

  return <Container>
    <Content>
      <LogoWrapperStyled icon={<Image src={BringGif} />} />
      <TitleStyled>
        Prove your trust level
      </TitleStyled>

      <TextStyled>
        A website is requesting verification of your trust score. This process is completely private and no personal information will be shared.
      </TextStyled>
      {!isEnoughPoints && <NoteStyled
        title='Insufficient trust level'
        status="warning"
      >
        You need {pointsNeeded - points} more points to reach {requiredStatus} level. <OpenPopupButton
          onClick={onClose}
        >Complete verifications</OpenPopupButton> to increase your trust score.
      </NoteStyled>}
      {
        !isEnoughPoints && <MessageStyled
          status="error"
        >
          <span>Required: <UserStatusRequired>{requiredStatus}</UserStatusRequired></span><Tag status='error'>{pointsNeeded} pts</Tag>
        </MessageStyled>
      }
      <MessageStyled>
        <span>Current: <UserStatus>{userStatus}</UserStatus></span><Tag status='info'>{points} pts</Tag>
      </MessageStyled>
      <ButtonsContainer>
        <ButtonStyled
          loading={loading}
          size='default'
          disabled={!isEnoughPoints}
          appearance="action"
          onClick={async () => {
            setLoading(true)
            try {
              
              // const proofs = []
              // const [
              //   tab
              // ] = await chrome.tabs.query({ active: true, currentWindow: true });
              // if (!tab || !tab.id) { return }
              // onClose()
            
              // chrome.tabs.sendMessage(tab.id as number, {
              //   type: TExtensionRequestType.proofs_generated,
              //   payload: proofs
              // })

            } catch (err) {
              setLoading(false)
              console.log({ err })
            }
            setLoading(false)
        }}
        >
          Confirm
        </ButtonStyled>

        <ButtonStyled
          size='default'
          onClick={onClose}
        >
          Cancel
        </ButtonStyled>
      </ButtonsContainer>
    </Content>
  </Container>
}

export default ConfirmationOverlay