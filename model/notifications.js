var mongoose = require("mongoose");

var notifcationCenter = new mongoose.Schema({
    username: String,
    campgroundId: String, 
    isRead: {type: Boolean, default: false}
});
var Notifcation = mongoose.model("Notification", notifcationCenter);
module.exports = Notifcation;