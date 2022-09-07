const express = require('express');
const router = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const {
    requireAuth
} = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const {
    registerValidation,
    loginValidation,
    deleteValidation
} = require('../validation')

//user profile page
router.get('/', requireAuth, (req, res) => {
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    var userId = decoded.id;
    console.log(userId);
    // Fetch the user by id
    User.findOne({
        _id: userId
    }).then((user) => {
        if (user) {
            res.render('cardPreview', {
                user
            });
        }
    });
});

//creating a token used for the user in the current session
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({
        id
    }, process.env.TOKEN_SECRET, {
        expiresIn: maxAge
    });
}

//register a user
router.post('/register', async (req, res) => {
    const {
        error
    } = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //Checking if the user is already in the db.
    const usernameExists = await User.findOne({
        email: req.body.username
    });
    if (usernameExists) return res.status(400).send('username already exists');

    //Hash passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);


    //Create new user.
    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
        title: req.body.title,
        occupation: req.body.occupation,
        phone: req.body.phone,
        bio: req.body.bio,
        email: req.body.email,
        password: hashedPassword,
        image: req.body.myImage
    });

    try {
        const savedUser = await user.save();
        const token = createToken(savedUser._id);
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: maxAge * 1000
        });
        res.redirect('/');
        //res.send({user: user._id});
    } catch (err) {
        res.status(400).send(err);
    }

});

//Delete
router.post('/delete', requireAuth, async (req, res) => {
    const {
        error
    } = deleteValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //Checking if email exists
    const user = await User.findOne({
        email: req.body.email
    });
    if (!user) return res.status(400).send('Email is not found.');

    //Deleting user
    User.findOneAndRemove({
        email: req.body.email
    }, function (err) {
        if (!err) {
            res.cookie('jwt', '', {
                maxAge: 1
            });
            console.log("User deleted");
            res.redirect('/');
        } else {
            res.status(400).send('Error');
        }
    });
});

//Edit profile
router.post('/edit_profile', requireAuth, async (req, res) => {
    console.log(req.file);
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    var userId = decoded.id;
    /*
        if(req.body.password){
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            User.findOneAndUpdate({_id: userId}, {$set:{password: hashedPassword}}, {new: true}, (err, doc) => {
                if(err){
                    console.log("Something went wrong");
                }
                console.log("Pass updated");
            });
        }
    */
    if (req.body.firstName) {
        User.findOneAndUpdate({
            _id: userId
        }, {
            $set: {
                firstName: req.body.firstName
            }
        }, {
            new: true
        }, (err, doc) => {
            if (err) {
                console.log("Something went wrong");
            }
            console.log("First name updated");
        });
    }
    if (req.body.lastName) {
        User.findOneAndUpdate({
            _id: userId
        }, {
            $set: {
                lastName: req.body.lastName
            }
        }, {
            new: true
        }, (err, doc) => {
            if (err) {
                console.log("Something went wrong");
            }
            console.log("Last name updated");
        });
    }
    if (req.body.street) {
        User.findOneAndUpdate({
            _id: userId
        }, {
            $set: {
                street: req.body.street
            }
        }, {
            new: true
        }, (err, doc) => {
            if (err) {
                console.log("Something went wrong");
            }
            console.log("Street updated");
        });
    }
    if (req.body.city) {
        User.findOneAndUpdate({
            _id: userId
        }, {
            $set: {
                city: req.body.city
            }
        }, {
            new: true
        }, (err, doc) => {
            if (err) {
                console.log("Something went wrong");
            }
            console.log("City updated");
        });
    }
    if (req.body.state) {
        User.findOneAndUpdate({
            _id: userId
        }, {
            $set: {
                state: req.body.state
            }
        }, {
            new: true
        }, (err, doc) => {
            if (err) {
                console.log("Something went wrong");
            }
            console.log("State updated");
        });
    }
    if (req.body.zip) {
        User.findOneAndUpdate({
            _id: userId
        }, {
            $set: {
                zip: req.body.zip
            }
        }, {
            new: true
        }, (err, doc) => {
            if (err) {
                console.log("Something went wrong");
            }
            console.log("ZIP updated");
        });
    }
    if (req.body.title) {
        User.findOneAndUpdate({
            _id: userId
        }, {
            $set: {
                title: req.body.title
            }
        }, {
            new: true
        }, (err, doc) => {
            if (err) {
                console.log("Something went wrong");
            }
            console.log("Title updated");
        });
    }
    if (req.body.occupation) {
        User.findOneAndUpdate({
            _id: userId
        }, {
            $set: {
                occupation: req.body.occupation
            }
        }, {
            new: true
        }, (err, doc) => {
            if (err) {
                console.log("Something went wrong");
            }
            console.log("Occupation updated");
        });
    }
    if (req.body.phone) {
        User.findOneAndUpdate({
            _id: userId
        }, {
            $set: {
                phone: req.body.phone
            }
        }, {
            new: true
        }, (err, doc) => {
            if (err) {
                console.log("Something went wrong");
            }
            console.log("Phone updated");
        });
    }
    if (req.body.bio) {
        User.findOneAndUpdate({
            _id: userId
        }, {
            $set: {
                bio: req.body.bio
            }
        }, {
            new: true
        }, (err, doc) => {
            if (err) {
                console.log("Something went wrong");
            }
            console.log("Bio updated");
        });
    }

    res.redirect('/user');
});

//Login
router.post('/login', async (req, res) => {
    const {
        email,
        password
    } = req.body;
    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: maxAge * 1000
        });
        console.log(user._id);
        res.redirect('/');
    } catch (err) {
        res.status(400).json({});
    }
});


//Log out
router.get('/logout', async (req, res) => {
    res.cookie('jwt', '', {
        maxAge: 1
    });
    res.redirect('/');
});


module.exports = router;