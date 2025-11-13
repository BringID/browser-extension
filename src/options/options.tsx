import React, {
  FC,
  useEffect,
  useState
} from 'react';
import { Page, Toggle } from '../components';
import { TitleStyled, Container } from './styled-components'

const Options: FC = () => {
  const [
    toggleValue,
    setToggleValue
  ] = useState<boolean>(false)

  useEffect(() => {
    chrome.storage.sync.get('devMode', (data) => {
      setToggleValue(Boolean(data.devMode))
    });
  }, [])

  return (
    <Page>
      <Container>
        <TitleStyled>Options</TitleStyled>
        <Toggle
          label='Dev Mode'
          size='small'
          value={Boolean(toggleValue)}
          onChange={async (value) => {
            await chrome.storage.sync.set({ devMode: value });
            setToggleValue(value)
          }}
        />
      </Container>
    </Page>
  );
};

export default Options;
