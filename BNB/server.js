var config_connect = require('./config/db/connect_details.js');
var config_schema = require('./config/db/user_schema.js');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
var oauth = require('oauth2-server');
var requirejs = require('requirejs');
var nodemon = require('nodemon');
var express = require('express');
var crypto = require('crypto');
var async = require('async');
var app = express();

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));

var mongoose = require('mongoose');
var dbDetails = config_connect.mongodb;
mongoose.Promise = global.Promise;
var db = mongoose.createConnection('mongodb://'+dbDetails.username+':'+dbDetails.password+'@'+dbDetails.host+'/'+dbDetails.database);

requirejs.config({
    config_connect : config_connect,
    config_schema : config_schema
});

var user = require('./routes/user');
app.use("/user",user);

app.listen(2000);

