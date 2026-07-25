import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Clear massive image caches left over from previous Workbox versions
if ('caches' in window) {
  caches.keys().then((names) => {
    names.forEach(name => {
      if (name.includes('image-cache') || name.includes('avatar-cache') || name.includes('tmdb') || name.includes('picsum')) {
        caches.delete(name);
      }
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
