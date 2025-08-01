import styled from "styled-components"

export const Container = styled.div`
  padding: 48px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`

export const ImageContainer = styled.div`
  width: 58px;
  height: 58px;
  border: 1px solid ${props => props.theme.primaryBorderColor};
  border-radius: 58px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.secondaryTextColor};
`

export const Title = styled.h3`
  font-size: 16px;
  line-height: 24px;
  margin: 0 0 8px;
  color: ${props => props.theme.primaryTextColor};
  text-align: center;
`

export const Text = styled.p`
  font-size: 14px;
  line-height: 20px;
  margin: 0 0 16px;
  color: ${props => props.theme.secondaryTextColor};
  text-align: center;
`

