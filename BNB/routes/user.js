var config = require('../config/db/connect_details.js');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var dbData = config.mongodb;
var mongoose = require('mongoose');
var db = mongoose.createConnection('mongodb://'+dbData.username+':'+dbData.password+'@'+dbData.host+'/'+dbData.database);
var express = require('express');
var router = express.Router();

//var DEVICES_COLLECTION = "devices";
var USERS_COLLECTION = "users";

var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({"error": message});
}

/* GET user login */
router.post('/login', function(req, res) {

      var username = req.body.username;
      var password = req.body.password;
      if ((username === null || password === null)) {
              handleError(res, "Invalid user input", "Must provide a valid Username and password.", 400);
              return;
            }
           db.collection(USERS_COLLECTION).findOne({$and:[{username: username}, {password: password}]}, function(err, result) {
                                                              if (err) {
                                                              handleError(res, err.message, "Failed to login.");
                                                              } else {
                                                              if(result){
                                                                    res.send(result);
                                                                   // console.log(result.role);
                                                              }
                                                              else{
                                                               handleError(res, "Failed to login.", "Username or password is incorrect.");
                                                              }
                                                              }
                                                              });
           });


/* Create user. */
router.post('/register', function(req, res) {
            var newUser = req.body;
            
            if ((req.body.email === null || 
                  req.body.username === null || 
                  req.body.password === null ||
                  req.body.gender === null ||
                  req.body.role === null ||
                  req.body.age === null )) {
            handleError(res, "Invalid user input", "Must provide all input fields.", 400);
            }
            
                 db.collection(USERS_COLLECTION).findOne({$and:[{email: req.body.email}]}, function(err, result) {
                                                              if (err) {
                                                              handleError(res, err.message, "");
                                                              } else {
                                                              if(result === null){
                                                                    db.collection(USERS_COLLECTION).insert(newUser, function(err, doc) {
                                                                  if (err) {
                                                                    handleError(res, err.message, "Failed to create new user.");
                                                                   } else {
                                                                    res.status(201, "User created").json(doc.ops[0]);
                                                              }
                                                        });
                                                              }else{
                                                               handleError(res, 500, "Email already exists.");
                                                              }
                                                              }
                                                              });

           
            });


/* Send Forgot Password Mail. */
router.post('/forgotPassword', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(10, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      db.collection(USERS_COLLECTION).findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          console.log("Could not be found");
        }else{
           db.collection("pwdReset").insert({ email: req.body.email, token: token, tokenExpireAt: Date.now() + 600000 }, function(err, doc) {
           done(err, token, doc);
           console.log(doc);
        });
        }


       
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport('SMTP', { host: 'smtp.gmail.com',
        secureConnection: false,
        port: 587,
        auth: {
            user: 'developer.jixtra@gmail.com',
            pass: 'Jixtra@123'
        }
      });
      var mailOptions = {
        to: req.body.email,
        from: 'developer.jixtra@gmail.com',
        subject: 'Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host +'#!/resetPwd/'+token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        done(err, 'done');
        if(done){
          console.log("An e-mail has been sent with further instructions.");
          // res.send("An e-mail has been sent with further instructions.");
        }
      });
    }
  ], function(err, result) {
    if (err) return next(err);
    res.send(result);
  });
});

// /* Get Reset Token*/
// router.get('/resetPwd/:token', function(req, res) {

//   console.log(req.params.token);
//   res.send(req.params.token);
// });

/* Reset Password. */
router.post('/resetPwd/:token', function(req, res) {
  async.waterfall([
    function(done) {
      db.collection("pwdReset").findOne({ token: req.params.token, tokenExpireAt: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          console.log('Password reset token is invalid or has expired.');
          res.send('Password reset token is invalid or has expired.');
        }else{
            var email = user.email;
            var password = req.body.password;
            db.collection(USERS_COLLECTION).update({$and: [ {email: email}, { password: { $ne: password} }]},{$set: {password: password}}, function(err, res){
              if(err){
                   console.log("Password could Not Be Updated To Existing One.");
                   res.send("Password could Not Be Updated To Existing One.");
              }else{
                  db.collection("pwdReset").remove({email: email}, function(err, doc){
                       console.log("Password Updated Successfully");
                       db.close();
                  });
                 

              }  
            });
        }

       });
    }
  ], function(err, result) {
       if (err) return next(err);
       res.send(result);
      });
});

module.exports = router;
