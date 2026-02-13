import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../popup/App';
import '@arco-design/web-react/dist/css/arco.css';
import '../popup/style.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element #root not found in floating window');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
