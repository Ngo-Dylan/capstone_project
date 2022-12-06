const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./User');
const Group = require('./Group');

const calendarSchema = new mongoose.Schema({
    group: {
        type: String
    },
    currentDate: {
        type: String
    }, 
    currentTime: {
        type: String
    },
    title:{
        type: [{id: Number, text: String}]
    },
    date:{
        type: [{id: Number, date: String}]
    },
    time:{
        type: [{id: Number, time: String}]
    },
    description:{
        type: [{id: Number, desc: String}]
    },
    user: {
        type: [{id: Number, user: String}]
    }
});

module.exports = mongoose.model('Calendar', calendarSchema);