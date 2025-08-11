import styled from "styled-components"
import {
  ProgressBar,
  Subtitle,
  Button,
  Message
} from '../../../components'
import { VerificationsList } from "../../components"

export const Container = styled.div`
  padding: 16px;
`

export const ProgressBarStyled = styled(ProgressBar)`
  margin-bottom: 48px;
`

export const SubtitleStyled = styled(Subtitle)`
  margin: 0 0 12px;
  display: flex;
  align-items: center;
`

export const ButtonStyled = styled(Button)`
  margin-left: auto;
`

export const MessageStyled = styled(Message)`
  margin-bottom: 10px;
`

export const VerificationsListStyled = styled(VerificationsList)`
  margin-bottom: 20px;
`