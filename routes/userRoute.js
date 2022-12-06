const express = require('express');
const router = require('express').Router();
const User = require('../models/User');
const Group = require('../models/Group');
const AgendaBoard = require('../models/AgendaBoard');
const List = require('../models/List');
const Notification = require('../models/Notification');
const Messenger = require('../models/Messenger');
const Calendar = require('../models/Calendar');
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

    const notification = await Notification.findOne({
        group: req.params.groupName
    });
    if (!notification) {
        const notification = new Notification({
            group: group.groupName
        });
        const notificationExists = await notification.save();
        console.log(notificationExists);
        res.render('notification', {
        group, notification
    });
    }
    else{
        res.render('notification', {
            group, notification
        });}
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

    Notification.findOneAndUpdate({
        group: req.params.groupName
    }, {
        $push: {
            user: {user: user.email},
            text: {text: " has added to the list."}
        }
    }, {
        new: true
    }, (err, doc) => {
        if (err) {
            console.log("Something went wrong");
        }
        console.log("Added to notification");
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
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    var userId = decoded.id;
    const user = await User.findOne({
        _id: userId
    });
    console.log(user.email)
    const group = await Group.findOne({
        groupName: req.params.groupName
    });
    if (!group) return res.status(400).send('Group is not found.');
    console.log(group)

    const messenger = await Messenger.findOne({
        group: req.params.groupName 
    });

    if (!messenger) {
        const messenger = new Messenger({
            group: group.groupName
        });
        const messengerExists = await messenger.save();
        console.log(messengerExists);
        res.render('messenger', {
        group, messenger, user
    });
    }
    else{
        res.render('messenger', {
            group, messenger, user
        });}
 });

 router.get('/group/:groupName/messenger/newmessage', async (req, res) => {
    const group = await Group.findOne({
        groupName: req.params.groupName
    });
    if (!group) return res.status(400).send('Group is not found.');

    const messenger = await Messenger.findOne({
        group: req.params.groupName 
    }); 
    res.render('messengerpost', {
        group, messenger
    });
});

 router.post('/group/:groupName/messenger/newmessage/:length', async (req, res) => {
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    var userId = decoded.id;
    const user = await User.findOne({
        _id: userId
    });

    let dateobj = new Date();
    let time = dateobj.getHours() + ":" + ("0" + (dateobj.getMinutes())).slice(-2);
    let date = ("0" + (dateobj.getMonth() + 1)).slice(-2) + "/" + ("0" + dateobj.getDate()).slice(-2);

    Messenger.findOneAndUpdate({
        group: req.params.groupName 
    }, {
        $push: {
            time: {id: req.params.length, time: time},
            date: {id: req.params.length, date: date},
            message: {id: req.params.length, text: req.body.message},
            user: {id: req.params.length, user: user.email}
        }
    }, {
        new: true
    }, (err, doc) => {
        if (err) {
            console.log("Something went wrong");
        }
        console.log("Added to messenger");
    }); 

    const url = '/user/group/' + req.params.groupName + '/messenger';

    res.redirect(url);
 });

 router.get('/group/:groupName/calendar', async (req, res) => {
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    var userId = decoded.id;
    const user = await User.findOne({
        _id: userId
    });

    let dateobj = new Date();
    let time = dateobj.getHours() + ":" + ("0" + (dateobj.getMinutes())).slice(-2);
    let date = ("0" + (dateobj.getMonth() + 1)).slice(-2) + "/" + ("0" + dateobj.getDate()).slice(-2) + "/" + dateobj.getFullYear();
    console.log(time);
    console.log(date);
    console.log(dateobj);

    const group = await Group.findOne({
        groupName: req.params.groupName
    });
    if (!group) return res.status(400).send('Group is not found.');

    const calendar = await Calendar.findOne({
        group: req.params.groupName 
    });   

    if (!calendar) {
        const calendar = new Calendar({
            group: group.groupName,
            currentDate: date,
            currentTime: time
        });
        const calendarExists = await calendar.save();
        console.log(calendarExists);
        res.render('calendar', {
        group, calendar, user
    });
    }
    else{
        Calendar.findOneAndUpdate({
            group: req.params.groupName
        }, {
            $set: {
                currentDate: date,
                currentTime: time
            }
        }, {
            new: true
        }, (err, doc) => {
            if (err) {
                console.log("Something went wrong");
            }
            console.log("Current date+time updated");
        });
        res.render('calendar', {
            group, calendar, user
        });}
 });

 router.post('/group/:groupName/calendar/addevent/:length', async (req, res) => {
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    var userId = decoded.id;
    const user = await User.findOne({
        _id: userId
    });
    if (!user) return res.status(400).send('User is not found.');

    const calendar = await Calendar.findOne({
        group: req.params.groupName
    });
    var month = parseInt(req.body.datetime.slice(0, 2));
    var day = parseInt(req.body.datetime.slice(3, 5));
    var year = parseInt(req.body.datetime.slice(6, 10));
    if(req.body.datetime.slice(11, 12)==1 && req.body.datetime.slice(12, 13)!=":"){
        if(parseInt(req.body.datetime.slice(11, 13))==12){
            var hour = 0;
        }
        else{
            var hour = req.body.datetime.slice(11, 13);
        }
        var minute = req.body.datetime.slice(14, 16);
        var ampm = req.body.datetime.slice(17);
    }
    else{
        var hour = req.body.datetime.slice(11, 12);
        var minute = req.body.datetime.slice(13, 15);
        var ampm = req.body.datetime.slice(16);
    }
    console.log(hour);
    console.log(minute);
    console.log(ampm);

    //MAKE 
    //12pm
    //come
    //before
    //1pm
    //on.
    //Ex. 1pm, 2pm, 12pm

    var index = 0;
    var found = false;
    while (found == false){
        if(req.params.length==0){
            break;
        }
        if(index==req.params.length){
            break;
        }
        if(calendar.time[index].time.slice(0, 1)==1 && req.body.datetime.slice(1, 2)!=":"){
            var singlehour=false;
        }
        else{
            var singlehour=true;
        }
        if(singlehour==false){
            if(req.params.length==0){
                break;
            }
            if(index==req.params.length){
                break;
            }
            if(year < parseInt(calendar.date[index].date.slice(6, 10))){
                found=true;
            }
            else if(year==parseInt(calendar.date[index].date.slice(6, 10))){
                if(month < parseInt(calendar.date[index].date.slice(0, 2))){
                    found=true;
                }
                else if(month == parseInt(calendar.date[index].date.slice(0, 2))){
                    if(day < parseInt(calendar.date[index].date.slice(3, 5))){
                        found=true;
                    }
                    else if(day==parseInt(calendar.date[index].date.slice(3, 5))){
                        if(ampm=="AM" && calendar.time[index].time.slice(6)=="PM"){
                            found=true;
                        }
                        else if(ampm == calendar.time[index].time.slice(6)){
                            if(hour < parseInt(calendar.time[index].time.slice(0, 2)) && parseInt(calendar.time[index].time.slice(0, 2))!=12){
                                found=true;
                            }
                            else if(hour == calendar.time[index].time.slice(0, 2) || (hour==0 && parseInt(calendar.time[index].time.slice(0, 2)==12))){
                                if(minute <= calendar.time[index].time.slice(3, 5)){
                                    found=true;
                                }
                                else index++;
                            }
                            else index++;
                        }
                        else index++;
                    }
                    else index++;
                }
                else index++;
            }
            else index++;
        }
        else{
            if(req.params.length==0){
                break;
            }
            if(index==req.params.length){
                break;
            }
            if(year < parseInt(calendar.date[index].date.slice(6, 10))){
                found=true;
            }
            else if(year==parseInt(calendar.date[index].date.slice(6, 10))){
                if(month < parseInt(calendar.date[index].date.slice(0, 2))){
                    found=true;
                }
                else if(month == parseInt(calendar.date[index].date.slice(0, 2))){
                    if(day < parseInt(calendar.date[index].date.slice(3, 5))){
                        found=true;
                    }
                    else if(day==parseInt(calendar.date[index].date.slice(3, 5))){
                        if(ampm=="AM" && calendar.date[index].date.slice(5)=="PM"){
                            found=true;
                        }
                        else if(ampm == calendar.time[index].time.slice(5)){
                            if(hour < calendar.time[index].time.slice(0, 1)){
                                found=true;
                            }
                            else if(hour == calendar.time[index].time.slice(0, 1)){
                                if(minute <= calendar.time[index].time.slice(2, 4)){
                                    found=true;
                                }
                                else index++;
                            }
                            else index++;
                        }
                        else index++;
                    }
                    else index++;
                }
                else index++;
            }
            else index++;
        }
    }
          
    

    var calendarTitle = calendar.title;
    var calendarDate = calendar.date;
    var calendarTime = calendar.time;
    var calendarDescription = calendar.description;
    var calendarUser = calendar.user;
    titleObj={id: index, text: req.body.title}
    dateObj={id: index, date: req.body.datetime.slice(0, 10)}
    timeObj={id: index, time: req.body.datetime.slice(11)}
    descObj={id: index, desc: req.body.description}
    userObj={id: index, user: user.email}

    calendarTitle.splice(index, 0, titleObj);
    calendarDate.splice(index, 0, dateObj);
    calendarTime.splice(index, 0, timeObj);
    calendarDescription.splice(index, 0, descObj);
    calendarUser.splice(index, 0, userObj);
    if(index!=req.params.length){
        for(let i=index+1; i<calendarTitle.length; i++){
            calendarTitle[i].id++;
            calendarDate[i].id++;
            calendarTime[i].id++;
            calendarDescription[i].id++;
            calendarUser[i].id++;
        }
    }
    // for(let i=0; i<calendarTitle.length; i++){
    //     console.log(calendarTitle[i]);
    // }
    // for(let i=0; i<calendarDate.length; i++){
    //     console.log(calendarDate[i]);
    // }
    // for(let i=0; i<calendarTime.length; i++){
    //     console.log(calendarTime[i]);
    // }
    // for(let i=0; i<calendarDescription.length; i++){
    //     console.log(calendarDescription[i]);
    // }
    // for(let i=0; i<calendarUser.length; i++){
    //     console.log(calendarUser[i]);
    // }
 

    const calendar2 = await Calendar.findOneAndUpdate({
        group: req.params.groupName},
        {$set: {
            title: calendarTitle,
            date: calendarDate, 
            time: calendarTime,
            description: calendarDescription, 
            user: calendarUser
        }
    });

    const url = '/user/group/' + req.params.groupName + '/calendar';

    res.redirect(url);
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

    Notification.findOneAndUpdate({
        group: req.params.groupName
    }, {
        $push: {
            user: {user: user.email},
            text: {text: " has added to the agenda board."}
        }
    }, {
        new: true
    }, (err, doc) => {
        if (err) {
            console.log("Something went wrong");
        }
        console.log("Added to notification");
    });

    const url = '/user/group/' + req.params.groupName + '/agendaboard';

    res.redirect(url);
});

//edit element
router.post('/group/:groupName/agendaboard/editelement/:id', async (req, res) => {
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    var userId = decoded.id;
    const user = await User.findOne({
        _id: userId
    });
    if (!user) return res.status(400).send('User is not found.');

    if (req.body.priority) {
        const agendaboard = await AgendaBoard.findOneAndUpdate({
            group: req.params.groupName, "priority.id": req.params.id},
            {$set: {"priority.$.priority": req.body.priority}
        });
        console.log(req.body.priority);
    }
    if (req.body.description) {
        const agendaboard2 = await AgendaBoard.findOneAndUpdate({
            group: req.params.groupName, "obj.id": req.params.id},
            {$set: {"obj.$.text": req.body.description}
        });
    }

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

//profile page
router.get('/editprofile', (req, res) => {

    console.log("running");
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    var userId = decoded.id;

    try{
    // Fetch the user by id
    User.findOne({
        _id: userId
    }).then((user) => {
        if (user) {
            res.render('editprofile', {
                user   
            });
        }
    });
    } catch (err) {
        res.status(400).send(err);
    }
 });

 router.get('/edit', (req, res) => {

    console.log("running");
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    var userId = decoded.id;

    try{
    // Fetch the user by id
    User.findOne({
        _id: userId
    }).then((user) => {
        if (user) {
            res.render('edit', {
                user   
            });
        }
    });
    } catch (err) {
        res.status(400).send(err);
    }
 });

 router.post('/editprofile', requireAuth, async (req, res) => {
    console.log("here")
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    var userId = decoded.id;


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
    res.redirect('/user/editprofile');
 });

module.exports = router;