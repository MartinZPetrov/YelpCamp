var Comment = require("../model/comments");
var Campground = require("../model/campgrounds");

var middleWare = {};

middleWare.checkCampgroundOwnerShip = function (req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, function (err, foundCampground) {
            if (err) {
                res.redirect("back");
            }
            else {
                if (req.user._id.equals(foundCampground.author.id) || req.user.isAdmin)
                    next();
                else
                    res.redirect("back");
            }
        });
    } else {
        res.redirect("back");
    }
};


middleWare.checkCommentOwnerShip = function (req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function (err, foundComment) {
            if (err) {
                res.redirect("back");
            }
            else {
                if (req.user._id.equals(foundComment.author.id) || req.user.isAdmin)
                    next();
                else
                    res.redirect("back");
            }
        });
    } else {
        res.redirect("back");
    }
};

middleWare.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You must logged in to do that!");
    res.redirect("/login");
};

module.exports = middleWare;