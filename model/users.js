var mongoose = require("mongoose");
var localMongoose = require("passport-local-mongoose");

var user = new mongoose.Schema({
	username: String,
	password: String
});

user.plugin(localMongoose);

var User = mongoose.model("User", user);

module.exports = User;
