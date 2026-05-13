import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './responsive.css'

// Suppress noisy unhandledrejection caused by some browser extensions/devtools messaging.
// Keep this narrow so we don't hide real app errors.
window.addEventListener('unhandledrejection', (event) => {
  try {
    const reason = event?.reason;

    // Normalize message for all shapes (string | Error | object)
    const msg =
      (reason && typeof reason === 'object' && 'message' in reason && typeof reason.message === 'string')
        ? reason.message
        : (typeof reason === 'string' ? reason : String(reason));

    const shouldSuppress =
      msg.includes('message channel closed') ||
      msg.includes('A listener indicated an asynchronous response') ||
      msg.includes('Channel closed') ||
      msg.includes('Extension context invalidated') ||
      msg.includes('chrome-extension');

    if (!shouldSuppress) return;

    // Swallow the rejection to avoid spamming console.
    // (preventDefault is not consistently reliable for this case)
  } catch {
    // Never break app because of this handler
  }
});



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

