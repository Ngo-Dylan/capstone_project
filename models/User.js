const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        max: 100,
        min: 4
    },
    lastName: {
        type: String,
        max: 100,
        min: 4
    },
    street: {
        type: String,
        min: 6
    },
    city: {
        type: String,
        min: 3
    },
    state: {
        type: String,
        min: 2
    },
    zip: {
        type: String,
        default: ""
    },
    title: {
        type: String,
        min: 2
    },
    occupation: {
        type: String,
        min: 4
    },
    phone: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        min: 10
    },

    email: {
        type: String,
        min: 6,
        max: 200
    },
    password: {
        type: String,
        max: 1024,
        min: 6
    },
    image: {
        type: String
    }
});

// static method to login user
userSchema.statics.login = async function (email, password) {
    const user = await this.findOne({
        email
    });
    if (user) {
        const auth = await bcrypt.compare(password, user.password);
        if (auth) {
            return user;
        }
        throw Error('incorrect password');
    }
    throw Error('incorrect email');
}

module.exports = mongoose.model('User', userSchema);