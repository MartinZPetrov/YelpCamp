var mongoose = require("mongoose");
var localMongoose = require("passport-local-mongoose");

var user = new mongoose.Schema({
	username: String,
	password: String,
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
