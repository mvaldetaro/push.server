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
        'https://fcm.googleapis.com/fcm/send/dCD_f-URa38:APA91bHG_95RZmbBrHeLrWDMTd_NEKHJEp_DH2wkaLqo8z1gmfD9CsDyly_POysq2LFMvElO1PY5RPq7B4C2LoPD4WaL2PmZ7oB7Fn0uC4c68WSW_82JA6lM-2EGLfvqy-m1b_vO3XYM',
    expirationTime: null,
    keys: {
        p256dh:
            'BBxlFD_Qc752QSDeVQ_8SKpu1VR3h8SDjUWVziu1m1uzL2JAot3GnxgZTgYSaLzzpSExuD5Rr8rHZicNtTd8nz8',
        auth: 'kCkId27O680WmwrLc3x_rg'
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

    const xPayload = JSON.stringify({
        title: 'Bem vindo(a)!',
        badge: 'https://static.investira.com.br/Investira_Icone_128_margin.png',
        icon: 'https://static.investira.com.br/Investira_Icone_512_margin.png'
    });

    res.status(201).json({});

    // Gambiarra para testar notification pelo browser;
    webPush
        .sendNotification(xSubscription, xPayload)
        .catch(rErr => console.error(rErr));
});

/**
 *
 * Envia notificaçoes para os assinantes
 */

const sendPushNotification = pSubscribes => {
    let counter = 1;

    setInterval(() => {
        pSubscribes.forEach(pSubscription => {
            const xPayload = JSON.stringify({
                title: 'Investira',
                body: `Assinante ${pSubscription.keys.auth} - ${counter}!`,
                badge:
                    'https://static.investira.com.br/Investira_Icone_128_margin.png',
                icon:
                    'https://static.investira.com.br/Investira_Icone_512_margin.png',
                tag: `${pSubscription.keys.auth}contato${counter}` // impede de exibir a mesma notificação
            });

            webPush
                .sendNotification(pSubscription, xPayload)
                .catch(rErr => console.error(rErr));
            console.log(
                `webpush -> sendNotification ${counter} -> ${pSubscription.keys.auth}`
            );
        });

        counter++;
    }, 10000);
};

// Dispara uma notificação a cada 10 segundos
sendPushNotification(subscribes);

// Inicia o servidor
app.set('port', process.env.PORT || 5000);

const server = app.listen(app.get('port'), () => {
    console.log(`Express running → PORT ${server.address().port}`);
});
