var mongoose = require("mongoose");
var userSchema = new mongoose.Schema({
username: String,
email : String,
age :Number,
gender : String,
role : String,
password : String
  });
var user = mongoose.model('user', userSchema);
module.exports = userSchema;