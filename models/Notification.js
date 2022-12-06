const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./User');
const Group = require('./Group');

const notificationSchema = new mongoose.Schema({
    group: {
        type: String
    },
    user:{
        type: [{user: String}]
    },
    text:{
        type: [{text: String}]
    }
});

module.exports = mongoose.model('Notification', notificationSchema);