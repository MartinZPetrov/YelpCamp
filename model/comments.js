var mongoose = require("mongoose");

var comments = new mongoose.Schema({
    text: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        name: String
    }
});

var Comment = mongoose.model("Comment", comments);

module.exports = Comment;
