import React from 'react';
import { createRoot } from 'react-dom/client';
import Offscreent from './offscreen';
import { Provider } from 'react-redux';
import store from '../popup/store';
const container = document.getElementById('app-container');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript

root.render(
  <Provider store={store}>
    <Offscreent />
  </Provider>,
);
