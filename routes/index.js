var express = require("express");
var router = express.Router();
var User = require("../model/users");
var Notification = require("../model/notifications");
var Campground = require("../model/campgrounds");
var passport = require("passport");
var { isLoggedIn } = require("../middleware");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
router.get("/", (req, res) => {
    res.render("landing");
});

router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", (req, res) => {
    var newUser = new User({
        username: req.body.username,
        email: req.body.email,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        avatar: req.body.avatar,
    });
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
        var campground = await Campground.find().where("author.id").equals(user.id).exec();
        res.render("users/profile", { user: user, campground: campground });
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
            options: { sort: { "_id": -1 } }
        }).exec();
        let allNotifications = user.notifications
        res.render("notifications/index", { allNotifications });
    } catch (error) {
        req.flash("error", err.message);
        res.redirect("back");
    }
});

// HANDLE NOTIFICATIONS
router.get("/notifications/:id", isLoggedIn, async (req, res) => {
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

// PASSWORD HANDLE
router.get("/forgot", (req, res) => {
    res.render("forgot");
});

router.post('/forgot', function (req, res, next) {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({ email: req.body.email }, function (err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function (err) {
                    done(err, token, user);
                });
            });
        },
        function (token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                // service: 'Gmail',
                service: 'smtp.gmail.com',
                port: 3000,
                secure: false,
                auth: {
                    user: 'martinpetrov8907@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'martinpetrov8907@gmail.com',
                subject: 'Node.js Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                console.log('mail sent');
                req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function (err) {
        if (err) return next(err);
        res.redirect('/forgot');
    });
});

router.get("/reset/:token", function (req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
        if (!user) {
            req.flash("error", "Password reset token is invalid or has expired");
            return res.redirect("/forgot");
        }
        res.render("reset", { token: req.params.token });
    });
});

router.post('/reset/:token', function (req, res) {
    async.waterfall([
        function (done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                if (req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, function (err) {
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(function (err) {
                            req.logIn(user, function (err) {
                                done(err, user);
                            });
                        });
                    })
                } else {
                    req.flash("error", "Passwords do not match.");
                    return res.redirect('back');
                }
            });
        },
        function (user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'smtp.gmail.com',
                port: 3000,
                secure: false,
                auth: {
                    user: 'martinpetrov8907@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'martinpetrov8907@gmail.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function (err) {
        res.redirect('/campgrounds');
    });
});

module.exports = router;


