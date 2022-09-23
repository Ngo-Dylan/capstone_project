const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./User');

const groupSchema = new mongoose.Schema({
    groupName: {
        type: String
    }, 
    groupCreator: {
        type: mongoose.ObjectId
    }, 
    groupMembers: {
        type: mongoose.ObjectId
    }
});

module.exports = mongoose.model('Group', groupSchema);