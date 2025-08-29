import React from 'react';
import {
  Container,
  TitleStyled,
  Header,
  Content,
  HeaderContent,
  SubtitleStyled,
  ArrowBackIconStyled,
} from './styled-components';
import { useNavigate } from 'react-router';
import { tasks } from '../../../common/core/task';
import { TasksList } from '../../components';
import { useVerifications } from '../../store/reducers/verifications';

const Tasks = () => {
  const navigate = useNavigate();
  const availableTasks = tasks();
  const { verifications } = useVerifications();

  return (
    <Container>
      <Header>
        <ArrowBackIconStyled onClick={() => navigate('/')} />
        <HeaderContent>
          <TitleStyled>Add Verifications</TitleStyled>
          <SubtitleStyled>Connect accounts to build your score</SubtitleStyled>
        </HeaderContent>
      </Header>

      <Content>
        <TasksList tasks={availableTasks} verifications={verifications} />
      </Content>
    </Container>
  );
};

export default Tasks;
