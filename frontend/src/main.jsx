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
  'extensionListener',
  'extension',
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
  if (s && suppressMessagePatterns.some((p) => s.includes(p))) return true;
  // Also try to detect patterns inside stack traces / nested objects
  try {
    const parsed = JSON.stringify(msg || '');
    if (suppressMessagePatterns.some((p) => parsed.includes(p))) return true;
  } catch {}
  return false;
}

// Capture phase to try to intercept before the browser/devtools logs.
window.addEventListener(
  'unhandledrejection',
  (event) => {
    try {
      if (!shouldSuppressMessage(event?.reason)) return;
      // prevent browser default reporting
      event.preventDefault?.();
      // keep console noise minimal; show the first few suppressed messages for diagnostics
      suppressedCount.count += 1;
      if (suppressedCount.count <= 5) console.debug('Suppressed extension rejection:', normalizeMessage(event?.reason));
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
      if (!shouldSuppressMessage(event?.message) && !shouldSuppressMessage(event?.error)) return;
      event.preventDefault?.();
      suppressedCount.count += 1;
      if (suppressedCount.count <= 5) console.debug('Suppressed extension error:', normalizeMessage(event?.message) || normalizeMessage(event?.error));
    } catch {
      // ignore
    }
  },
  true
);

// Track how many suppressed messages we've seen to avoid spamming console.
const suppressedCount = { count: 0 };



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)

