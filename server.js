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

app.post('/subscribe', (req, res) => {
    const subscription = req.body;

    res.status(201).json({});

    const payload = JSON.stringify({
        title: 'Push notifications with Service Workers'
    });

    webPush
        .sendNotification(subscription, payload)
        .catch(rErr => console.error(rErr));
});

app.set('port', process.env.PORT || 5000);

const server = app.listen(app.get('port'), () => {
    console.log(`Express running → PORT ${server.address().port}`);
});
