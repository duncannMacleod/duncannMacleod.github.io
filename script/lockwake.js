let wakeLock = null;

async function requestWakeLock() {
    try {
        wakeLock = await navigator.wakeLock.request('screen');
        console.log('Wake Lock activé');

        // Réactiver le Wake Lock si la page perd le focus
        document.addEventListener('visibilitychange', async () => {
            if (wakeLock !== null && document.visibilityState === 'visible') {
                wakeLock = await navigator.wakeLock.request('screen');
            }
        });
    } catch (err) {
        console.error(`Erreur lors de l’activation du Wake Lock: ${err.name}, ${err.message}`);
    }
}

requestWakeLock();

