import React from 'react';
import { createRoot } from 'react-dom/client';
import SidePanel from './side-panel';
import { Provider } from 'react-redux';
import { store } from './store';
const container = document.getElementById('app-container');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript

const originalLog = console.log;
console.log = function (...args: never[]) {
  originalLog('[Sidebar Log] ', ...args, '');
};

console.log('Hello from the webpage!');

root.render(
  <Provider store={store}>
    <SidePanel />
  </Provider>,
);
