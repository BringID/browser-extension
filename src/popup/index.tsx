import React from 'react';
import { createRoot } from 'react-dom/client';
import Popup from './popup';
import store from './store';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { setDevMode } from './store/reducers/user';

const container = document.getElementById('app-container');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript

chrome.storage.sync.get('devMode', (data) => {
  store.dispatch(setDevMode(Boolean(data.devMode)));
});

root.render(
  <Provider store={store}>
    <HashRouter>
      <Popup />
    </HashRouter>
  </Provider>,
);
