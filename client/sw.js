self.addEventListener('push', event => {
    console.log(event);
    const data = event.data.json();
    console.log(data);

    const options = {
        ...data,
        actions: [
            {
                action: 'view-action',
                title: 'Visualizar'
            }
        ]
    };

    console.log(options);

    // https://developers.google.com/web/fundamentals/push-notifications/handling-messages
    const promiseChain = self.registration.showNotification(
        data.title,
        options
    );

    event.waitUntil(promiseChain);
});

self.addEventListener('notificationclick', function(event) {
    if (!event.action) {
        // Was a normal notification click
        console.log('Notification Click.');
        clients.openWindow('http://localhost:5001/');

        //event.notification.close();
        return;
    }

    switch (event.action) {
        case 'view-action':
            console.log('Abrir web app');
            window.open('http://localhost:5001/');
            //event.notification.close();
            break;
        default:
            console.log(`Unknown action clicked: '${event.action}'`);
            //event.notification.close();
            break;
    }
});
