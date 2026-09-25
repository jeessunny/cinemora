import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Force clear all stale Workbox / PWA caches so browser immediately uses latest code
if ('caches' in window) {
  caches.keys().then((names) => {
    names.forEach(name => {
      caches.delete(name);
    });
  });
}

// Unregister old service workers that might be looking for the deleted caches
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
