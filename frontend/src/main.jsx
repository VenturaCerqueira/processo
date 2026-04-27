import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './responsive.css'

// Suppress browser extension message channel errors
window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason?.message || String(event.reason);
  if (
    msg.includes('message channel closed') ||
    msg.includes('asynchronous response') ||
    msg.includes('chrome-extension') ||
    msg.includes('Extension context invalidated')
  ) {
    event.preventDefault();
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

