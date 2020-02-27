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

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

webPush.setVapidDetails(config.EMAIL, publicVapidKey, privateVapidKey);

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

const payload = JSON.stringify({
    title: 'Push notifications with Service Workers'
});

app.post('/subscribe', (req, res) => {
    const xSubscription = req.body;

    console.log(xSubscription);

    res.status(201).json({});

    webPush
        .sendNotification(xSubscription, payload)
        .catch(rErr => console.error(rErr));
});

setInterval(() => {
    webPush
        .sendNotification(subscription, payload)
        .catch(rErr => console.error(rErr));
    console.log('webpush');
}, 10000);

app.set('port', process.env.PORT || 5000);

const server = app.listen(app.get('port'), () => {
    console.log(`Express running → PORT ${server.address().port}`);
});
