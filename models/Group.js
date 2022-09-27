const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./User');

const groupSchema = new mongoose.Schema({
    groupName: {
        type: String
    }, 
    groupCreator: {
        type: String
    }, 
    groupMembers: {
        type: [String]
    }
});

module.exports = mongoose.model('Group', groupSchema);