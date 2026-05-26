import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import './index.css'
import './responsive.css'

// Suppress noisy browser-devtools/extension messaging errors.
// Keep this narrow so we don't hide real app errors.
const suppressMessagePatterns = [
  'message channel closed',
  'A listener indicated an asynchronous response',
  'Channel closed',
  'Extension context invalidated',
  'chrome-extension',
];

function normalizeMessage(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    if (typeof value.message === 'string') return value.message;
    try {
      return JSON.stringify(value);
    } catch {
      // fall through
    }
  }
  return String(value);
}

function shouldSuppressMessage(msg) {
  const s = normalizeMessage(msg);
  if (!s) return false;
  return suppressMessagePatterns.some((p) => s.includes(p));
}

// Capture phase to try to intercept before the browser/devtools logs.
window.addEventListener(
  'unhandledrejection',
  (event) => {
    try {
      if (!shouldSuppressMessage(event?.reason)) return;
      event.preventDefault?.();
    } catch {
      // Never break app because of this handler
    }
  },
  true
);

window.addEventListener(
  'error',
  (event) => {
    try {
      if (!shouldSuppressMessage(event?.message)) return;
      event.preventDefault?.();
    } catch {
      // ignore
    }
  },
  true
);



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)

