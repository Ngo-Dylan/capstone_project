const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./User');
const Group = require('./Group');

const agendaBoardSchema = new mongoose.Schema({
    group: {
        type: String
    },
    row: {
        type: [{id: Number, row: Number}]
    },
    obj:{
        type: [{id: Number, text: String}]
    },
    user: {
        type: [{id: Number, user: String}]
    }
});

module.exports = mongoose.model('AgendaBoard', agendaBoardSchema);