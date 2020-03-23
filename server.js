require('dotenv').config({ path: 'variables.env' });

const express = require('express');
const fs = require('fs');
const https = require('https');
const webPush = require('web-push');
const bodyParser = require('body-parser');
const path = require('path');
const uuid = require('uuid');
const config = require('./config');

const app = express();

const mongoose = require('mongoose');

app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));

// Define diretório do servidor estático
app.use(express.static(path.join(__dirname, 'client')));

function mongo() {
    this.mongoConnection = mongoose
        .connect('mongodb://localhost:27017/mongodb-push-server', {
            useNewUrlParser: true,
            useFindAndModify: true,
            useUnifiedTopology: true
        })
        .then(() => {
            console.info('Conectado ao banco de dados');
        })
        .catch(err => {
            console.error('erro ao conectar', err);
        });
}

mongo();

const Subscriber = require('./schemas/subscriber');

webPush.setVapidDetails(
    config.EMAIL,
    config.PUBLIC_VAPID_KEY,
    config.PRIVATE_VAPID_KEY
);

/**
 *
 * getUsers
 */

const getUsers = (pUserId = {}) => {
    const subscribes = Subscriber.find(pUserId, (err, users) => {
        return users;
    });
    return subscribes;
};

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

app.post('/subscribe', (req, res) => {
    const xSubscription = req.body;
    //const xUid = uuid.v4();

    //console.log('xUid', xUid);
    console.log('xSubscription', xSubscription);

    const xSubscriber = new Subscriber({
        user_id: xSubscription.keys.auth,
        push_assign: JSON.stringify(xSubscription)
    });

    xSubscriber.save(err => {
        if (err) {
            console.error(err);
            res.status(400).json({
                message: 'Erro ao criar registro'
            });
        } else {
            res.status(201).json({
                message: 'Registro criado com sucesso'
            });
        }
    });

    // if (err) {
    //     res.status(400).json({ error: err });
    // } else {
    //     res.status(201).json({
    //         message: 'Registro criado com sucesso'
    //     });
    // }
});

app.post('/unsubscribe', (req, res) => {
    const xAuthKey = req.body.keys.auth;
    Subscriber.deleteOne({ user_id: xAuthKey }, err => {
        if (err) {
            res.status(400).json({ error: JSON.stringify(err) });
        } else {
            res.status(201).json({ message: `${xAuthKey} removido` });
        }
    });
});

app.post('/notify', (req, res) => {
    const xPayload = req.body;
    getUsers({ user_id: xPayload.user_id }).then(user => {
        const xSubscription = JSON.parse(user[0].push_assign);
        sendPushNotification(xSubscription, new Date(), xPayload.body);
    });
    res.status(200).json({});
});

app.get('/users', (req, res) => {
    getUsers()
        .then(users => {
            res.status(200).json({ data: users });
        })
        .catch(rErr => {
            res.status(400).json({ error: JSON.stringify(pErr) });
        });
});

app.post('/notifyall', (req, res) => {
    getUsers().then(users => {
        users.forEach(user => {
            sendPushNotification(JSON.parse(user.push_assign), new Date());
        });
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

const sendPushNotification = (
    pSubscription,
    counter,
    pBody = 'body default'
) => {
    const xPayload = JSON.stringify({
        title: 'Investira',
        lang: 'pt-BR',
        body: `${pBody} | ${pSubscription.keys.auth} - ${counter}!`,
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
