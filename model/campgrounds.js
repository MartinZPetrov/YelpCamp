var mongoose = require("mongoose");

var campground = new mongoose.Schema({
    name: String,
    image: String,
    price: String,
    description: String,
    createdAt: { type: Date, default: Date.now },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        },
    ],
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        name: String
    }
});

var Campground = mongoose.model("Campground", campground);

module.exports = Campground;
