import React from 'react';
import ReactDOM from 'react-dom/client';
// Keystone design tokens (CSS custom properties used across the layout).
import '@fe-infra/keystone-design-tokens/root.css';
import './app.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
