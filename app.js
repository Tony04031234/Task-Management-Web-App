var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
// create a 'pool' (group) of connections to be used for connecting with our SQL server
// var dbConnectionPool = mysql.createPool({
//       host: 'localhost',
//       database: 'website'
// });
// use mysql in this app
var mysql = require('mysql');

var dbConnectionPool = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "tuan0403"
});
// check the database connection
dbConnectionPool.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

var app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use(function(req, res, next) {
    req.pool = dbConnectionPool;
    next();
});

// session and cookie heres
app.use(session({                             //           //
  secret: 'a string of your choice',          //           //
  resave: false,                              // THIS CODE //
  saveUninitialized: true,                    //           //
  cookie: { httpOnly: false }                    //           //
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

module.exports = app;
