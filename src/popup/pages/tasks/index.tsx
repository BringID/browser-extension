import React from 'react';
import {
  Container,
  TitleStyled,
  Header,
  Content,
  HeaderContent,
  SubtitleStyled,
  ArrowBackIconStyled,
  TextStyled,
  LinkStyled,
} from './styled-components';
import { useNavigate } from 'react-router';
import { tasks } from '../../../common/core/task';
import { TasksList } from '../../components';
import { useVerifications } from '../../store/reducers/verifications';
import configs from '../../../configs';

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
      <TextStyled>
        No verifications available? Request new ones in our{' '}
        <LinkStyled target="_blank" href={configs.TELEGRAM_URL}>
          Telegram group
        </LinkStyled>
      </TextStyled>
    </Container>
  );
};

export default Tasks;
