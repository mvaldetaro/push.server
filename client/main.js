// The `urlBase64ToUint8Array()` function is the same as in
// https://www.npmjs.com/package/web-push#using-vapid-key-for-applicationserverkey
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

const publicVapidKey =
    'BJo1VWCxpBe-yXN53W3qESEw2n7_nHEGokELWfpnh4u5ob0s3wVTkArGij62nHfCN2XejD5adNDWBpSEkUhDCpw';

const triggerPush = document.querySelector('.btn-push');
const message = document.querySelector('#msg');

if ('serviceWorker' in navigator) {
    console.log('Iniciando service worker');
    message.innerHTML = 'Iniciando service worker';
    runPushNotification().catch(error => console.error(error));
} else {
    message.innerHTML = 'Sem service worker';
}

if ('actions' in Notification.prototype) {
    message.innerHTML = `${message.innerHTML}
        Actions suportadas`;
} else {
    message.innerHTML = `${message.innerHTML}
    Actions não suportadas`;
}

async function runPushNotification() {
    if ('serviceWorker' in navigator) {
        const register = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
        });

        const subscription = await register.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });

        await fetch('/subscribe', {
            method: 'POST',
            body: JSON.stringify(subscription),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } else {
        console.error('Service workers are not supported in this browser');
    }
}

triggerPush.addEventListener('click', () => {
    runPushNotification().catch(error => console.error(error));
});
