const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriberSchema = new Schema({
    user_id: { type: String, required: true },
    push_assign: { type: String, required: true }
});

module.exports = mongoose.model('Subscriber', SubscriberSchema);
