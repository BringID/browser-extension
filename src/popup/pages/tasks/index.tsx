import React, {
  ReactElement
} from 'react'
import {
  Container,
  TitleStyled,
  Header,
  Content,
  HeaderContent,
  SubtitleStyled,
  ArrowBackIconStyled
} from './styled-components'
import TProps from './types'
import { useSelector } from 'react-redux'
import { AppRootState } from '../../store/reducers'
import { useNavigate } from 'react-router'
import { tasks } from "../../../common/task"
import { TasksList } from '../../components';

export default function Home(props: {
  tab?: 'history' | 'network';
} & TProps): ReactElement {


  const navigate = useNavigate()
  const availableTasks = tasks()
  console.log({ availableTasks })

  return (
    <Container>
      <Header>
        <ArrowBackIconStyled
          onClick={() => navigate('/')}
        />
        <HeaderContent>
          <TitleStyled>
            Add Verifications
          </TitleStyled>
          <SubtitleStyled>
            Connect accounts to build your score
          </SubtitleStyled>
        </HeaderContent>
        
      </Header>

      <Content>

        <TasksList tasks={availableTasks} />

      </Content>
      
    </Container>
  )
}
