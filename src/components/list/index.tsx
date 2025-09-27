import React, { FC } from 'react';
import TProps from './types';
import { Container, ListItem } from './styled-components';

const List: FC<TProps> = ({ items, className }) => {
  return (
    <Container className={className}>
      {items.map((item) => (
        <ListItem>{item}</ListItem>
      ))}
    </Container>
  );
};

export default List;
