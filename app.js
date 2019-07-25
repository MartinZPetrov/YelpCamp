var express = require("express"),
	app = express(),
	bodyParser = require('body-parser'),
	mongoose = require("mongoose"),
	Seed = require("./seed"),
	passport = require("passport"),
	LocalStrategy = require("passport-local"),
	User = require("./model/users"),
	methodOverride = require("method-override"),
	flash = require("connect-flash");

var indexRoute = require("./routes/index"),
	commentRoute = require("./routes/comment"),
	campgroundRoute = require("./routes/campground");

// DB
mongoose.connect("mongodb://localhost:27017/yelp_camp", { useNewUrlParser: true });
// DELETE --- UPDATE requiests
app.use(methodOverride("_method"));

//BODY request data
app.use(bodyParser.urlencoded({ extended: true }));

// CSS FILE
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(flash());

// PASSPORT SETTINGS
app.use(require("express-session")({
	secret: "Once again than again",
	resave: false,
	saveUnitialized: false

}));
app.locals.moment = require("moment");
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// SEED DATA
// Seed();

app.use(async function (req, res, next) {
	res.locals.currentUser = req.user;
	if (req.user) {
		try {
			let user = await User.findById(req.user._id).populate("notifications", null, { isRead: false }).exec();
			res.locals.notifications = user.notifications.reverse();
		} catch (error) {
			console.log(error);
		}
	}
	
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use("/", indexRoute);
app.use("/campgrounds/:id/comments", commentRoute);
app.use("/campgrounds", campgroundRoute);

app.listen(3000, () => {
	console.log("server listening on port 3000");
});


