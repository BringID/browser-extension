import {
  Title,
  Text,
  Button,
  Checkbox,
  Subtitle,
  Tag,
  ExpandableContainer,
} from '../../../components';
import Icons from '../../../components/icons';

import styled from 'styled-components';

export const Container = styled.div`
  padding: 12px;
  height: 100%;
  position: fixed;
  width: 100%;
  min-height: 100%;
  overflow: auto;
  top: 0;
  z-index: 100;
  left: 0;
  background-color: ${(props) => props.theme.backgroundColor};

  display: flex;
  flex-direction: column;
`;

export const TitleStyled = styled(Title)`
  text-align: left;
  font-size: 18px;
  margin-bottom: 8px;
`;

export const Content = styled.div`
  padding: 0px;
`;

export const Result = styled.div`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.secondaryBorderColor};
  margin-bottom: 16px;
`;

export const SubtitleStyled = styled(Subtitle)`
  font-size: 14px;
  font-weight: 500;
  color: ${(props) => props.theme.primaryTextColor};
  margin: 0 0 10px;

  display: flex;
  align-items: center;

  gap: 6px;
`;

export const TagStyled = styled(Tag)`
  margin-left: auto;
`;

export const TextStyled = styled(Text)`
  text-align: left;
  font-size: 12px;
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const ActionTextStyled = styled(Text)<{
  onClick: () => void;
}>`
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
  flex-direction: column;
  width: 100%;
`;

export const ButtonStyled = styled(Button)``;

export const Hr = styled.hr`
  margin: 12px 0;
  border: none;
  border-bottom: 1px solid ${(props) => props.theme.secondaryBorderColor};
`;

export const Footer = styled.footer`
  margin-top: auto;
`;

export const LockIconStyled = styled(Icons.Lock)`
  color: ${(props) => props.theme.secondaryTextColor};
`;

export const ExpandableContainerStyled = styled(ExpandableContainer)``;

export const MiniSubtitle = styled.h5`
  font-size: 12px;
  color: ${(props) => props.theme.primaryTextColor};
  margin: 0 0 4px;
`;
