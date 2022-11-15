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
    phone: {
        type: String,
        default: ""
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
    groups: {
        type: [String]
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