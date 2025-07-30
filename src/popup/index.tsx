import React from 'react'
import { createRoot } from 'react-dom/client'
import Popup from './popup'
import store from './store'
import { Provider } from 'react-redux'

const container = document.getElementById('app-container')
const root = createRoot(container!) // createRoot(container!) if you use TypeScript

root.render(
  <Provider store={store}>
    <Popup />
  </Provider>,
);
