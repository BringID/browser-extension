import React, {
  FC
} from 'react'
import TProps from './types'
import {
  Container,
  ListItem
} from './styled-components'

const List: FC<TProps> = ({
  items
}) => {
  return <Container>
    {items.map(item => <ListItem>{item}</ListItem>)}
  </Container>
}

export default List