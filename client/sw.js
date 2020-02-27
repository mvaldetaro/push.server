self.addEventListener('push', event => {
    console.log(event);
    const data = event.data.json();

    self.registration.showNotification(data.title, {
        body: 'Yay it works!'
    });
});
