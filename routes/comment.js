var express = require("express");
var router = express.Router({ mergeParams: true });
var Campground = require("../model/campgrounds");
var Comment = require("../model/comments");
var middleWare = require("../middleware");

router.get("/new", (req, res) => {
    Campground.findById(req.params.id, function (err, campground) {
        if (err) console.log(err);
        else {
            console.log(campground);
            res.render("comment/new", { campground: campground });
        }
    });
});

router.get("/:comment_id/edit", middleWare.checkCommentOwnerShip, (req, res) => {
    Comment.findById(req.params.comment_id, (err, comment) => {
        if (err) {
            console.log(err);
            res.redirect("back");
        }
        else {
            res.render("comment/edit", { campground_id: req.params.id, comment: comment });
        }
    });
});


// UPDATE

router.put("/:comment_id", middleWare.checkCommentOwnerShip, (req, res) => {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, comment) => {
        if (err) {
            console.log(err);
            res.redirect("back");
        }
        else {
            req.flash("success", "Comment updated!");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// DELETE
router.delete("/:comment_id", middleWare.checkCommentOwnerShip, (req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if (err) {
            res.redirect("back");
        }
        else {
            req.flash("success", "Comment deleted!");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});


router.get("/new", middleWare.isLoggedIn, (req, res) => {
    Campground.findById(req.params.id, function (err, campground) {
        if (err) console.log(err);
        else {
            console.log(campground);
            res.render("comment/new", { campground: campground });
        }
    });
});

router.post("/", middleWare.isLoggedIn, (req, res) => {
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err);
            res.redirect("/campogrunds");
        }
        else {
            Comment.create(req.body.comment, (error, comment) => {
                if (error) console.log(error);
                else {
                    console.log(campground);
                    comment.author.name = req.user.username;
                    comment.author.id = req.user._id;
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success", "Added comment!");
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});


module.exports = router;