var express = require("express");
var router = express.Router();
var User = require("../model/users");
var passport = require("passport");

router.get("/", (req, res) => {
    res.render("landing");
});

router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", (req, res) => {
    var newUser = new User({ username: req.body.username });
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            req.flash("error", err);
            res.redirect("/register");
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

module.exports = router;


