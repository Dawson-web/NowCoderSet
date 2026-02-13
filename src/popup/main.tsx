import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@arco-design/web-react/dist/css/arco.css';
import '../styles/tailwind.css';
import './style.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element #root not found in popup');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
