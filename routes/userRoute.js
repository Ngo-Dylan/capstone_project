const express = require('express');
const router = require('express').Router();
const User = require('../models/User');
const Group = require('../models/Group');
const jwt = require('jsonwebtoken');
const {
    requireAuth
} = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const {
    registerValidation,
    groupValidation,
    loginValidation,
    deleteValidation
} = require('../validation');

 router.get('/group/:groupName/notification', async (req, res) => {
    const group = await Group.findOne({
        groupName: req.params.groupName
    });
    if (!group) return res.status(400).send('Group is not found.');
    console.log(group)
    res.render('notification', {
        group
    });
 });

 router.get('/group/:groupName/list', async (req, res) => {
    const group = await Group.findOne({
        groupName: req.params.groupName
    });
    if (!group) return res.status(400).send('Group is not found.');
    console.log(group)
    res.render('list', {
        group
    });
 });

 router.get('/group/:groupName/agendaboard', async (req, res) => {
    const group = await Group.findOne({
        groupName: req.params.groupName
    });
    if (!group) return res.status(400).send('Group is not found.');
    console.log(group)
    res.render('agendaboard', {
        group
    });
 });

 router.get('/group/:groupName/messenger', async (req, res) => {
    const group = await Group.findOne({
        groupName: req.params.groupName
    });
    if (!group) return res.status(400).send('Group is not found.');
    console.log(group)
    res.render('messenger', {
        group
    });
 });

 router.get('/group/:groupName/calendar', async (req, res) => {
    const group = await Group.findOne({
        groupName: req.params.groupName
    });
    if (!group) return res.status(400).send('Group is not found.');
    console.log(group)
    res.render('calendar', {
        group
    });
 });

 router.get('/create', (req, res) => {
    res.render('create');
 });
 router.get('/add', (req, res) => {
    res.render('addtogroup');
 });

//user profile page
router.get('/', requireAuth, (req, res) => {
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    var userId = decoded.id;
    // Fetch the user by id
    User.findOne({
        _id: userId
    }).then((user) => {
        if (user) {
            res.render('index', {
                user
            });
        }
    });
});

//group page
router.get('/group/:groupName', async (req, res) => {
    console.log("running");
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    var userId = decoded.id;
    const group = await Group.findOne({
        groupName: req.params.groupName
    });
    if (!group) return res.status(400).send('Group is not found.');
    console.log(group);
    try{
        // Fetch the user by id
    User.findOne({
        _id: userId
    }).then((user) => {
        if (user) {
            res.render('grouppage', {
                group, user   
            });
        }
    });
    } catch (err) {
        res.status(400).send(err);
    }
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

    //Checking if the email is already in the db.
    const emailExists = await User.findOne({
        email: req.body.email // changed from username -> email
    });
    if (emailExists) return res.status(400).send('email is already registered');

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
        res.status(400).json('incorrect password'); // error of incorrect password
    }
});

//Make a group
router.post('/create', requireAuth, async (req, res) => {
    const {
        error
    } = groupValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //Checking if the user is already in the db.
    const groupExists = await Group.findOne({
        groupName: req.body.groupName
    });
    if (groupExists) return res.status(400).send('group already exists');

    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    var userId = decoded.id;
    //Create new group.
    const group = new Group({
        groupName: req.body.groupName,
        groupCreator: userId
    });

    User.findOneAndUpdate({
        _id: userId
    }, {
        $push: {
            groups: group.groupName
        }
    }, {
        new: true
    }, (err, doc) => {
        if (err) {
            console.log("Something went wrong");
        }
        console.log("Added to group");
    });

    try {
        const savedGroup = await group.save();
        res.redirect('/');
    } catch (err) {
        res.status(400).send(err);
    }


});

//Add to group
router.post('/add', requireAuth, async (req, res) => {
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    var userId = decoded.id;

    const group = await Group.findOne({
        groupName: req.body.groupName
    });


    Group.findOneAndUpdate({
        groupName: req.body.groupName
    }, {
        $push: {
            groupMembers: userId
        }
    }, {
        new: true
    }, (err, doc) => {
        if (err) {
            console.log("Something went wrong");
        }
        console.log("user added");
    });

    User.findOneAndUpdate({
        _id: userId
    }, {
        $push: {
            groups: group.groupName
        }
    }, {
        new: true
    }, (err, doc) => {
        if (err) {
            console.log("Something went wrong");
        }
        console.log("Added to group");
    });
    res.redirect('/');
});

//Log out
router.get('/logout', async (req, res) => {
    console.log('in logout');
    res.cookie('jwt', '', {
        maxAge: 1
    });
    res.redirect('/');
});

router.get('/group/logout', async (req, res) => {
    console.log('in logout');
    res.cookie('jwt', '', {
        maxAge: 1
    });
    res.redirect('/');
});

module.exports = router;