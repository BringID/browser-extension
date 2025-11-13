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
  Tiers,
  Tier,
  Body,
  Footer,
} from './styled-components';
import DefaultPluginIcon from '../../assets/img/default-plugin-icon.png';
import { TNotarizationGroup } from '../../common/types';

const defineTiers = (groups?: TNotarizationGroup[]) => {
  if (!groups || groups.length === 1) return null;

  return groups
    .map((group) => {
      const checks = group.checks;
      if (!checks) {
        return '';
      }

      return `${checks[0].value}+: ${group.points} pts.`;
    })
    .filter((item) => item);
};

const TaskContainer: FC<TProps> = ({
  status,
  children,
  icon,
  title,
  description,
  selectable,
  selected,
  onSelect,
  groups,
  id,
}) => {
  const tiers = defineTiers(groups);
  return (
    <Container status={status}>
      <Body selectable={selectable}>
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
      </Body>
      {tiers && (
        <Footer>
          Tiers:
          <Tiers>
            {tiers.reverse().map((tier) => (
              <Tier>{tier}</Tier>
            ))}
          </Tiers>
        </Footer>
      )}
    </Container>
  );
};

export default TaskContainer;
