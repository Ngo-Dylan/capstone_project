const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./User');
const Group = require('./Group');

const messengerSchema = new mongoose.Schema({
    group: {
        type: String
    },
    time: {
        type: [{id: Number, time: String}]
    },
    date: {
        type: [{id: Number, date: String}]
    },
    message:{
        type: [{id: Number, text: String}]
    },
    user: {
        type: [{id: Number, user: String}]
    }
});

module.exports = mongoose.model('Messenger', messengerSchema);