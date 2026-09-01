import './style.css';
import { AppController } from './ui/app-controller';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('app');
  if (root) {
    const controller = new AppController(root);
    controller.init();
  }
});

// ── PWA Service Worker Registration ──
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./sw.js')
        .then((reg) => {
          console.log('[SW] Registered — scope:', reg.scope);
          // Check for updates
          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[SW] New version available.');
                }
              };
            }
          };
        })
        .catch((err) => {
          console.warn('[SW] Registration failed:', err);
        });
    });
  } else {
    // Unregister SW in development to prevent caching issues
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }
}
