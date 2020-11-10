var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
  username: {type: String, required: true},
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  title: {type: String, required: true},
  phone: {type: Number, required: true},
  city: {type: String, required: true},
  address: {type: String, required: true},
  status: {type: String, required: true},
  generelField: {type: String, required: true},
  isAdmin: { type: Boolean, default: false },
  password: String
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User",userSchema);
