require('dotenv').config({ path: 'variables.env' });

const express = require('express');
const webPush = require('web-push');
const bodyParser = require('body-parser');
const path = require('path');
const config = require('./config');

const app = express();
app.use(bodyParser.json());

// Define diretório do servidor estático
app.use(express.static(path.join(__dirname, 'client')));

console.log(config);

webPush.setVapidDetails(
    config.EMAIL,
    config.PUBLIC_VAPID_KEY,
    config.PRIVATE_VAPID_KEY
);

// Assinatura do usuário desktop
let subscription = {
    endpoint:
        'https://fcm.googleapis.com/fcm/send/cxidph6ok_c:APA91bHQOD2VPI_Pt4mNC_Rs_py3c5u1NOtGBd37qyGjPJfilZJatrZYaMjdDKmfI-BURGg5PLmqNsoLCQYHL0nsdLf29nUYSEBRV1rOiACXkYhgJSX46dije1Lx4TVri5Vz-W_U4QcV',
    expirationTime: null,
    keys: {
        p256dh:
            'BKLcoP64j9uycF9Hhca_ZEJcPEVyy_pq5QAXyiJe0MdSFjyDs_ky6MCXRgzqnWpm9YY0QnkVbz6ltXEffvnEvE0',
        auth: 'aa7MjTUQWvlCLYkXB2_Zfw'
    }
};

let subscriptionMobile = {
    endpoint:
        'https://fcm.googleapis.com/fcm/send/eCAdrwpa1qc:APA91bGygB2KbQPPkSTZIH66dJ4fpbped0Yk-8e6QcDwZdYhj1TDc9seXMjR6AFuV0PPEwLkiovvlHEy7xTmglxPslnvq89hFCGcuFApraUVVWAqVrZZv9Rr8fP4gnpkq7BLntNYz8sS',
    expirationTime: null,
    keys: {
        p256dh:
            'BNAnSwoRB20M0ooDyBJCSStkfryLAuEXifcISIkn6o98Ru9pNXooxbTLuoFG93C62S6JmKHB3C2udGv_pBxscPE',
        auth: 'KTTpxHFovuv2SJp2y4aMtw'
    }
};

let subscribes = [subscription, subscriptionMobile];

app.post('/subscribe', (req, res) => {
    const xSubscription = req.body;

    console.log(xSubscription);

    // const xPayload = JSON.stringify({
    //     title: 'Bem vindo(a)!',
    //     badge: 'https://static.investira.com.br/Investira_Icone_128_margin.png',
    //     icon: 'https://static.investira.com.br/Investira_Icone_512_margin.png'
    // });

    res.status(201).json({});
});

app.post('/unsubscribe', (req, res) => {
    const xSubscription = req.body;

    console.log(xSubscription);

    // const xPayload = JSON.stringify({
    //     title: 'Bem vindo(a)!',
    //     badge: 'https://static.investira.com.br/Investira_Icone_128_margin.png',
    //     icon: 'https://static.investira.com.br/Investira_Icone_512_margin.png'
    // });

    res.status(201).json({});
});

app.post('/notify', (req, res) => {
    const xSubscription = req.body;
    console.log(xSubscription);

    sendPushNotification(xSubscription, new Date());

    res.status(200).json({});
});

app.post('/notifyall', (req, res) => {
    console.log('notifyall');
    subscribes.forEach(pSubscription => {
        sendPushNotification(pSubscription, new Date());
    });

    res.status(200).json({});
});

/**
 *
 * Envia notificaçoes para os assinantes
 */

const sendIntervalPushNotification = pSubscribes => {
    let counter = 1;

    setInterval(() => {
        pSubscribes.forEach(pSubscription => {
            sendPushNotification(pSubscription, counter);
        });

        counter++;
    }, 10000);
};

const sendPushNotification = (pSubscription, counter) => {
    const xPayload = JSON.stringify({
        title: 'Investira',
        lang: 'pt-BR',
        body: `Assinante ${pSubscription.keys.auth} - ${counter}!`,
        //data: {}, // Aqui pode passar qualquer tipo de dado
        badge: 'https://static.investira.com.br/Investira_Icone_128_margin.png',
        icon: 'https://static.investira.com.br/Investira_Icone_512_margin.png',
        tag: `${pSubscription.keys.auth}contato${counter}` // impede de exibir a mesma notificação
    });

    webPush
        .sendNotification(pSubscription, xPayload)
        .catch(rErr => console.error(rErr));
    console.log(
        `webpush -> sendNotification ${counter} -> ${pSubscription.keys.auth}`
    );
};

// Dispara uma notificação a cada 10 segundos
//sendIntervalPushNotification(subscribes);

// Inicia o servidor
app.set('port', process.env.PORT || 5000);

const server = app.listen(app.get('port'), () => {
    console.log(`Express running → PORT ${server.address().port}`);
});
