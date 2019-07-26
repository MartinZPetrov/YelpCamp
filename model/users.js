var mongoose = require("mongoose");
var localMongoose = require("passport-local-mongoose");

var user = new mongoose.Schema({
	username: {type: String, unique:true, required:true},
	password: String,
	firstName: String,
	lastName: String,
	email: {type: String, unique:true, required:true},
	resetPasswordToken: String,
	resetPasswordExpires: Date,
	avatar: String,
	notifications: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Notification"		
		}
	],
	followers: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		}
	],
	isAdmin: {type: Boolean, default: false}
});

user.plugin(localMongoose);

var User = mongoose.model("User", user);

module.exports = User;
