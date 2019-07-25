var express = require("express");
var router = express.Router();
var User = require("../model/users");
var Notification = require("../model/notifications");
var passport = require("passport");
var { isLoggedIn } = require("../middleware");
router.get("/", (req, res) => {
    res.render("landing");
});

router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", (req, res) => {
    var newUser = new User({ username: req.body.username });
    if (req.body.adminCode === "secret") {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            req.flash("error", err);
            res.render("register", { error: err.message });
        }
        passport.authenticate("local")(req, res, () => {
            // req.flash("success", "Welcome to YelpCamp " + user.username);
            req.flash("success", "Welcome dear " + user.username);
            res.redirect("/campgrounds");
        });
    });
});


// LOGOUT
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "Logged you out");
    res.redirect("/campgrounds");
});

// LOGIN
router.get("/login", (req, res) => {
    res.render("login");
});

router.post("/login", passport.authenticate('local', {
    successRedirect: '/campgrounds',
    failureRedirect: '/login'
}), (req, res) => {

});

// USER PROFILE
router.get("/users/:id", async (req, res) => {
    try {
        let user = await User.findById(req.params.id).populate("followers").exec();
        res.render("profile", {user: user });
    } catch (error) {
        req.flash("error", error.message);
        return res.redirect("back");
    }
});

// FOLLOW USER
router.get("/follow/:id", isLoggedIn, async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        user.followers.push(req.user._id);
        user.save();
        req.flash("success", "Succesfully followed" + user.username + "!");
        res.redirect("/users/" + req.params.id);
    } catch (error) {
        req.flash("error", err.message);
        res.redirect("back");
    }
});
// VIEW ALL NOTIFICATIONS
router.get("/notifications", isLoggedIn, async (req, res) => {
    try {
        let user = await User.findById(req.user._id).populate({
            path: "notifications",
            options: {sort: {"_id": -1}}
        }).exec();
        let allNotifications = user.notifications
        res.render("notifications/index", {allNotifications});
    } catch (error) {
        req.flash("error", err.message);
        res.redirect("back");
    }
});

// HANDLE NOTIFICATIONS
router.get("/notifications/:id", isLoggedIn, async (req, res) =>{
    try {
        let notification = await Notification.findById(req.params.id);
        notification.isRead = true;
        notification.save();
        res.redirect("/campgrounds/" + notification.campgroundId)
    } catch (error) {
        req.flash("error", error.message);
        res.redirect("back");
    }
});

module.exports = router;


