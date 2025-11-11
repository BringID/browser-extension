import React, {
  FC,
  useEffect,
  useState
} from 'react';
import { Page } from '../components';
import { Toggle } from '../components'

const Options: FC = () => {
  const [
    toggleValue,
    setToggleValue
  ] = useState<boolean | null>(null)

  useEffect(() => {
    chrome.storage.sync.get('devMode', (data) => {
      setToggleValue(Boolean(data.devMode))
    });
  }, [])

  useEffect(() => {
    if (toggleValue === null) {
      return 
    }
    chrome.storage.sync.set({ devMode: toggleValue });
  }, [
    toggleValue
  ])

  return (
    <Page>
      <Toggle
        label='Dev Mode'
        size='small'
        value={Boolean(toggleValue)}
        onChange={(value) => setToggleValue(value)}
      />
    </Page>
  );
};

export default Options;
