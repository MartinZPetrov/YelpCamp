var Comment = require("../model/comments");
var Campground = require("../model/campgrounds");
var Review = require("../model/reviews");
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


middleWare.checkReviewOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Review.findById(req.params.review_id, function(err, foundReview){
            if(err || !foundReview){
                res.redirect("back");
            }  else {
                // does user own the comment?
                if(foundReview.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middleWare.checkReviewExistence = function (req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id).populate("reviews").exec(function (err, foundCampground) {
            if (err || !foundCampground) {
                req.flash("error", "Campground not found.");
                res.redirect("back");
            } else {
                // check if req.user._id exists in foundCampground.reviews
                var foundUserReview = foundCampground.reviews.some(function (review) {
                    return review.author.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "You already wrote a review.");
                    return res.redirect("/campgrounds/" + foundCampground._id);
                }
                // if the review was not found, go to the next middleware
                next();
            }
        });
    } else {
        req.flash("error", "You need to login first.");
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
