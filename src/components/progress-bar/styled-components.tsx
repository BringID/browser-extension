import styled from 'styled-components'

export const ProgressBarContainer = styled.div`
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  position: relative;
  background: ${props => props.theme.blankColor};
`

export const Bar = styled.div`
  position: absolute;
  top: 0;
  background: ${props => props.theme.primaryTextColor};
  left: 0;
  border-radius: 2px;
  height: 100%;
`

export const Wrapper = styled.div`
  
`

export const Titles = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 3px;
`

export const Title = styled.span`
  color: ${props => props.theme.secondaryTextColor};
  font-size: 12px;
`