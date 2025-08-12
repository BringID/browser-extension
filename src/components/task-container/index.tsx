import React, { FC } from 'react';
import TProps from './types';
import {
  Container,
  Title,
  Subtitle,
  Content,
  ImageWrapper,
  Icon,
  CheckboxStyled,
} from './styled-components';
import DefaultPluginIcon from '../../assets/img/default-plugin-icon.png';

const TaskContainer: FC<TProps> = ({
  status,
  children,
  icon,
  title,
  description,
  selectable,
  selected,
  onSelect,
  id,
}) => {
  return (
    <Container status={status} selectable={selectable}>
      {selectable && (
        <CheckboxStyled
          checked={Boolean(selected)}
          onClick={onSelect}
          id={id}
        />
      )}
      <ImageWrapper>
        <Icon src={icon || DefaultPluginIcon} />
      </ImageWrapper>
      <Content>
        <Title>{title}</Title>
        <Subtitle>{description}</Subtitle>
      </Content>
      {children}
    </Container>
  );
};

export default TaskContainer;
