const express = require('express');
const router = require('express').Router();
const User = require('../models/User');
const Group = require('../models/Group');
const AgendaBoard = require('../models/AgendaBoard');
const List = require('../models/List');
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
    deleteValidation,
    groupLeave
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

    const list = await List.findOne({
        group: req.params.groupName
    });
    if (!list) {
        const list = new List({
            group: group.groupName
        });
        const listExists = await list.save();
        console.log(listExists);
        res.render('list2', {
        group, list
    });
    }
    else{
        res.render('list2', {
            group, list
        });}
 });

 router.post('/group/:groupName/list/addelement/:length', async (req, res) => {
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    var userId = decoded.id;
    const user = await User.findOne({
        _id: userId
    });
    if (!user) return res.status(400).send('User is not found.');

    List.findOneAndUpdate({
        group: req.params.groupName
    }, {
        $push: {
            title: {id: req.params.length,text: req.body.title},
            desc: {id: req.params.length, text: req.body.description},
            user: {id: req.params.length, user: user.email}
        }
    }, {
        new: true
    }, (err, doc) => {
        if (err) {
            console.log("Something went wrong");
        }
        console.log("Added to list");
    });

    const url = '/user/group/' + req.params.groupName + '/list';

    res.redirect(url);
});

router.get('/group/:groupName/list/editelement/:length', async (req, res) => {
    const group = await Group.findOne({
        groupName: req.params.groupName
    });
    if (!group) return res.status(400).send('Group is not found.');

    const id = req.params.length;

    const list = await List.findOne({
        group: req.params.groupName
    });
    if (!list) {
        const list = new List({
            group: group.groupName
        });
        const listExists = await list.save();
        console.log(listExists);
        res.render('editList', {
        group, list, id
    });
    }
    else{
        res.render('editList', {
            group, list, id
        });}
 });

router.post('/group/:groupName/list/editelement/:id', async (req, res) => {
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    var userId = decoded.id;
    const user = await User.findOne({
        _id: userId
    });
    if (!user) return res.status(400).send('User is not found.');

    if (req.body.title) {
        const list = await List.findOneAndUpdate({
            group: req.params.groupName, "title.id": req.params.id},
            {$set: {"title.$.text": req.body.title}
        });
    }
    if (req.body.desc) {
        const list2 = await List.findOneAndUpdate({
            group: req.params.groupName, "desc.id": req.params.id},
            {$set: {"desc.$.text": req.body.desc}
        });
    }

    const url = '/user/group/' + req.params.groupName + '/list';

    res.redirect(url);
});

 router.get('/group/:groupName/agendaboard', async (req, res) => {
    const group = await Group.findOne({
        groupName: req.params.groupName
    });
    if (!group) return res.status(400).send('Group is not found.');

    const agenda = await AgendaBoard.findOne({
        group: req.params.groupName 
    });   

    if (!agenda) {
        const agenda = new AgendaBoard({
            group: group.groupName
        });
        const agendaExists = await agenda.save();
        console.log(agendaExists);
        res.render('agendaboard', {
        group, agenda
    });
    }
    else{
        res.render('agendaboard', {
            group, agenda
        });}
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

//group agenda board
router.post('/group/:groupName/agendaboard/addelement/:length', async (req, res) => {
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    var userId = decoded.id;
    const user = await User.findOne({
        _id: userId
    });
    if (!user) return res.status(400).send('User is not found.');
    AgendaBoard.findOneAndUpdate({
        group: req.params.groupName
    }, {
        $push: {
            row: {id: req.params.length,row: 0},
            obj: {id: req.params.length, text: req.body.bio},
            user: {id: req.params.length, user: user.email},
            priority: {id: req.params.length, priority: req.body.priority}
        }
    }, {
        new: true
    }, (err, doc) => {
        if (err) {
            console.log("Something went wrong");
        }
        console.log("Added to agendaboard");
    });

    const url = '/user/group/' + req.params.groupName + '/agendaboard';

    res.redirect(url);
});

//edit row up
router.post('/group/:groupName/agendaboard/editrowup/:id', async (req, res) => {
    const agenda = await AgendaBoard.findOne({
        group: req.params.groupName
    });
    if (!agenda) return res.status(400).send('User is not found.');
    const rowNum = agenda.row[req.params.id].row + 1;
    const agenda2 = await AgendaBoard.findOneAndUpdate({
        group: req.params.groupName, "row.id": req.params.id},
        {$set: {"row.$.row": rowNum}
    });
    const url = '/user/group/' + req.params.groupName + '/agendaboard';
    res.redirect(url);
});

//edit row down
router.post('/group/:groupName/agendaboard/editrowdown/:id', async (req, res) => {
    const agenda = await AgendaBoard.findOne({
        group: req.params.groupName
    });
    console.log(req.params.id)
    if (!agenda) return res.status(400).send('User is not found.');
    const rowNum = agenda.row[req.params.id].row - 1;
    const agenda2 = await AgendaBoard.findOneAndUpdate({
        group: req.params.groupName, "row.id": req.params.id},
        {$set: {"row.$.row": rowNum}
    });
    const url = '/user/group/' + req.params.groupName + '/agendaboard';
    res.redirect(url);
});

//delete an element
router.post('/group/:groupName/agendaboard/delete/:id', async (req, res) => {
    const agenda = await AgendaBoard.findOne({
        group: req.params.groupName
    });

    var agendaRow = agenda.row;
    var agendaObj = agenda.obj;
    var agendaUser = agenda.user;
    var agendaPriority = agenda.priority;
    agendaRow.splice(req.params.id, 1);
    agendaObj.splice(req.params.id, 1);
    agendaUser.splice(req.params.id, 1);
    agendaPriority.splice(req.params.id, 1);
    
    for (let i = req.params.id; i<agendaRow.length; i++){
        agendaRow[i].id--
    }
    for (let i = req.params.id; i<agendaRow.length; i++){
        agendaObj[i].id--
    }
    for (let i = req.params.id; i<agendaRow.length; i++){
        agendaUser[i].id--
    }
    for (let i = req.params.id; i<agendaRow.length; i++){
        agendaPriority[i].id--
    }

    const agenda2 = await AgendaBoard.findOneAndUpdate({
        group: req.params.groupName},
        {$set: {
            row: agendaRow,
            obj: agendaObj, 
            user: agendaUser,
            priority: agendaPriority
        }
    });

    const url = '/user/group/' + req.params.groupName + '/agendaboard';
    res.redirect(url);
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

    const user = await User.findOne({
        _id: userId
    });
    if (!user) return res.status(400).send('User is not found.');

    //Create new group.
    const group = new Group({
        groupName: req.body.groupName,
        groupCreator: user.email
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
    if(!group) return res.status(400).send('That group does not exist');

    const user = await User.findOne({
        _id: userId
    });
    if (!user) return res.status(400).send('User is not found.');


    Group.findOneAndUpdate({
        groupName: req.body.groupName
    }, {
        $push: {
            groupMembers: user.email
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

//Leave Group
router.post('/group/:groupName/leave', requireAuth, async (req, res) => {
    const {
        error
    } = groupValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Remove User from Group's database
    const group = await Group.findOne({
        groupName: req.params.groupName
    });
    if (!group) return res.status(400).send('Group is not found.');
    console.log(group);
    User.findOneAndRemove({
        groupName: req.body.groupName
    }, function (err) {
        if (!err){
            console.log(groupName + " left");
        }
        else{
            res.status(400).send('Error');
        }
    });

    // Remove Group from User's database
    User.findOneAndUpdate({
        _id: userId
    }, {
        $pull: {
            groups: group.groupName
        }
    }, {
        new: true
    }, (err, doc) => {
        if (err) {
            console.log("Something went wrong");
        }
        console.log("Removed from group");
    });

    // save
    try {
        const savedGroup = await group.save();
        res.redirect('/');
    } catch (err) {
        res.status(400).send(err);
    }
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