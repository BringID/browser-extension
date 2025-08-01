import styled from "styled-components"
import {
  LogoWrapper,
  Title,
  Text,
  Button,
  Icons
} from "../../../components"

export const CheckIconStyled = styled(Icons.Check)`
  width: 24px;
  height: auto;
  color: ${props => props.theme.successStatusTextColor};
`

export const ClockIconStyled = styled(Icons.Clock)`
  width: 24px;
  height: auto;
`

export const LogoWrapperStyled = styled(LogoWrapper)`
  margin-bottom: 24px;
`

export const Container = styled.div`
  text-align: center;
  padding: 24px;
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  z-index: 1;
  left: 0;
  background-color: ${props => props.theme.blankColor};
`

export const TextStyled = styled(Text)`
  margin: 0 0 16px;
`

export const TitleStyled = styled(Title)`
  margin: 0 0 24px;
`

export const Timer = styled.div`
  font-size: 36px;
  line-height: 40px;
  margin-bottom: 48px;
  color: ${props => props.theme.primaryTextColor};
`

export const ButtonStyled = styled(Button)`
  width: 100%;
`

export const Content = styled.div`
  border: 1px solid ${props => props.theme.primaryBorderColor};
  border-radius: 8px;
  width: 100%;
  height: 100%;
  text-align: center;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
`