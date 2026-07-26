const UPDATE_INTERVAL_MS = 60 * 60 * 1000;
let registration;
let safeToUpdate = true;

function activateWaitingWorker() {
  if (safeToUpdate && registration?.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}

export function setPwaSafeToUpdate(safe) {
  safeToUpdate = safe;
  activateWaitingWorker();
}

export function registerPwa() {
  if (!('serviceWorker' in navigator)) return;

  const hadController = Boolean(navigator.serviceWorker.controller);
  let reloading = false;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return;
    reloading = true;
    location.reload();
  });

  addEventListener('load', async () => {
    try {
      registration = await navigator.serviceWorker.register('./sw.js');
      registration.addEventListener('updatefound', () => {
        const installing = registration.installing;
        installing?.addEventListener('statechange', () => {
          if (installing.state === 'installed') activateWaitingWorker();
        });
      });
      activateWaitingWorker();
    } catch (error) {
      console.error('Kunde inte aktivera offlinestöd.', error);
    }
  });

  async function checkForUpdate() {
    if (!registration || !navigator.onLine || document.visibilityState !== 'visible') return;
    try {
      await registration.update();
      activateWaitingWorker();
    } catch (error) {
      console.warn('Kunde inte söka efter en HànHàn-uppdatering.', error);
    }
  }

  document.addEventListener('visibilitychange', checkForUpdate);
  addEventListener('focus', checkForUpdate);
  setInterval(checkForUpdate, UPDATE_INTERVAL_MS);
}
