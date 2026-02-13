import React from 'react';
import ReactDOM from 'react-dom/client';
import FloatingPanel from './FloatingPanel';
import '@arco-design/web-react/dist/css/arco.css';
import './style.css';

function mountFloatingPanel() {
  const id = 'nowcoder-float-root';
  let container = document.getElementById(id);
  if (!container) {
    container = document.createElement('div');
    container.id = id;
    document.body.appendChild(container);
  }

  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <FloatingPanel />
    </React.StrictMode>
  );
}

// Only mount in top-level browsing contexts (avoid iframes where not desired).
if (window.top === window.self) {
  mountFloatingPanel();
}

console.info('[NowCoderSet] Floating panel injected on NowCoder page');
