const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./User');
const Group = require('./Group');

const listSchema = new mongoose.Schema({
    group: {
        type: String
    },
    title:{
        type: [{id: Number, text: String}]
    },
    desc:{
        type: [{id: Number, text: String}]
    },
    user: {
        type: [{id: Number, user: String}]
    }
});

module.exports = mongoose.model('List', listSchema);