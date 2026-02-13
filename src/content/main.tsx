import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import FloatingPanel from './FloatingPanel';
import '@arco-design/web-react/dist/css/arco.css';
import '../styles/tailwind.css';
import './style.css';

function SidebarHost() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (
      message: { action?: string },
      _sender: chrome.runtime.MessageSender,
      sendResponse: (resp?: unknown) => void
    ) => {
      if (message.action === 'toggleSidebar') {
        setOpen((v) => !v);
        sendResponse?.({ status: !open });
      } else if (message.action === 'openSidebar') {
        setOpen(true);
        sendResponse?.({ status: true });
      } else if (message.action === 'closeSidebar') {
        setOpen(false);
        sendResponse?.({ status: false });
      }
      // returning false keeps the channel open only if needed; we close immediately
      return false;
    };

    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  }, [open]);

  return (
    <>
      <div
        className={`nc-sidebar-mask ${open ? 'show' : ''}`}
        onClick={() => setOpen(false)}
      />
      <div className={`nc-sidebar ${open ? 'open' : ''}`}>
        <FloatingPanel />
      </div>
    </>
  );
}

function mountSidebar() {
  const id = 'nowcoder-float-root';
  let container = document.getElementById(id);
  if (!container) {
    container = document.createElement('div');
    container.id = id;
    document.body.appendChild(container);
  }

  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <SidebarHost />
    </React.StrictMode>
  );
}

// Only mount in top-level browsing contexts (avoid iframes where not desired).
if (window.top === window.self) {
  mountSidebar();
}

console.info('[NowCoderSet] Sidebar injected on page');
