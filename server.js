// modules =================================================
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const User = require('./models/User');

dotenv.config();

// set our port
const port = 3000;
// configuration ===========================================
const path = require('path');

// Set EJS as templating engine
app.set('view engine', 'ejs');

// Middleware
app.use(express.json());
app.use(express.urlencoded({
   extended: true
}));
app.use(cookieParser());
app.use(express.static(__dirname + '/assets/img'));
app.use(express.static(__dirname + '/assets/css'));

// config files
mongoose.connect(process.env.DB_CONNECT, {
   useNewUrlParser: true,
   useUnifiedTopology: true
}); //Mongoose connection created

//Middleware to send post requests
app.use(express.json());

app.use(express.static('uploads'));

// frontend routes =========================================================
app.get('/', (req, res) => {
   const token = req.cookies.jwt;
   if (token) {
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
      var userId = decoded.id;
      console.log(userId);
      // Fetch the user by id
      User.findOne({
         _id: userId
      }).then((user) => {
         if (user) {
            res.render('index', {
               user
            });
         } else {
            res.render('index');
         }
      });
   } else {
      res.render('index', {
         user: false
      });
   }
});


app.get('/signup', (req, res) => {
   res.render('signup');
});

app.get('/login', (req, res) => {
   res.render('login');
});

app.get('/editform', (req, res) => {
   res.render('editform');
});

app.get('/delete', (req, res) => {
   res.render('delete');
});



//defining routes
const userRoute = require('./routes/userRoute');

app.use('/user', userRoute);



//SAMPLE ROUTE
app.get('/tproute', function (req, res) {
   res.send('This is routing for the application developed using Node and Express...');
});

// startup our app at http://localhost:3000
app.listen(process.env.PORT || 3000, () => console.log(`App listening on port ${port}!`));