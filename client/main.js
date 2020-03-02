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
const triggerPushAll = document.querySelector('.btn-push-all');
const triggerSubscribe = document.querySelector('.btn-push-subscribe');
const triggerUnsubscribe = document.querySelector('.btn-push-unsubscribe');
const message = document.querySelector('#msg');
const local = document.querySelector('#local');
const hasServiceWorker = 'serviceWorker' in navigator;
let serviceWorker = null;

if (hasServiceWorker) {
    message.innerHTML = '<li>Service worker iniciado</li>';
    serviceWorker = navigator.serviceWorker.register('/sw.js', {
        scope: '/'
    });
    //runPushNotification().catch(error => console.error(error));
} else {
    message.innerHTML = '<li>Sem service worker</li>';
}

if ('actions' in Notification.prototype) {
    message.innerHTML = `${message.innerHTML}
        <li>Actions suportadas</li>`;
} else {
    message.innerHTML = `${message.innerHTML}
    <li>Actions não suportadas</li>`;
}

if (window.localStorage) {
    message.innerHTML = `${message.innerHTML}
    <li>localStorage suportado</li>`;
    window.localStorage.setItem('push_messages', '[]');
    console.log(localStorage.length);
    console.log(JSON.parse(window.localStorage.getItem('push_messages')));
    local.innerHTML = `${window.localStorage.getItem('push_messages')}`;
} else {
    message.innerHTML = `${message.innerHTML}
    <li>localStorage não suportado</li>`;
}

async function subscribeUser() {
    if (hasServiceWorker) {
        // const register = await navigator.serviceWorker.register('/sw.js', {
        //     scope: '/'
        // });

        const register = await serviceWorker;

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

async function unsubscribeUser() {
    if (hasServiceWorker) {
        const register = await serviceWorker;
        const subscription = await register.pushManager.getSubscription();

        if (subscription) {
            const unsubscribe = await subscription.unsubscribe();
            return unsubscribe;
        } else {
            console.error('Usuário não inscrito');
        }

        // await fetch('/unsubscribe', {
        //     method: 'POST',
        //     body: JSON.stringify(subscription),
        //     headers: {
        //         'Content-Type': 'application/json'
        //     }
        // });
    } else {
        console.error('Service workers are not supported in this browser');
    }
}

async function dispatchPushNotification() {
    if (hasServiceWorker) {
        // const register = await navigator.serviceWorker.register('/sw.js', {
        //     scope: '/'
        // });
        const register = await serviceWorker;

        const subscription = await register.pushManager.getSubscription();

        console.log(subscription);

        await fetch('/notify', {
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

async function dispatchPushNotificationAll() {
    await fetch('/notifyall', {
        method: 'POST'
    });
}

triggerSubscribe.addEventListener('click', () => {
    subscribeUser().catch(error => console.error(error));
});

triggerUnsubscribe.addEventListener('click', () => {
    unsubscribeUser()
        .then(rRes => {
            console.log('Inscrição cancelada', rRes);
        })
        .catch(error => console.error(error));
});

triggerPush.addEventListener('click', e => {
    e.preventDefault();
    dispatchPushNotification().catch(error => console.error(error));
});

triggerPushAll.addEventListener('click', e => {
    e.preventDefault();
    dispatchPushNotificationAll().catch(error => console.error(error));
});
