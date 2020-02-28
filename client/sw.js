self.addEventListener('push', event => {
    console.log(event);
    const data = event.data.json();
    console.log(data);

    const options = {
        body: data.body,
        badge: './images/Investira_Icone_128_margin.png',
        icon: './images/Investira_Icone_512_margin.png',
        actions: [
            {
                action: 'view-action',
                title: 'Visualizar'
            }
        ],
        ...(data.tag && { tag: data.tag })
    };

    self.registration.showNotification(data.title, options);
});
