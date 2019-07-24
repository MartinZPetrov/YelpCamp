var express = require("express"),
	app = express(),
	bodyParser = require('body-parser'),
	mongoose = require("mongoose"),
	Campground = require("./model/campgrounds"),
	Comment = require("./model/comments"),
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
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// SEED DATA
// Seed();

app.use(function (req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use("/", indexRoute);
app.use("/campgrounds/:id/comments", commentRoute);
app.use("/campgrounds", campgroundRoute);

// app.get("/", (req, res) => {
// 	res.render("landing");
// });

// // ------------------
// // CAMPGROUNDS ROUTES
// // ------------------
// app.get("/campgrounds", (req, res) => {	
// 	var user = req.user;
// 	Campground.find({}, function(err, camp){
// 		if(err){
// 			console.log(err);	
// 		}else{
// 			res.render("campground/campgrounds", {campgrounds: camp});		
// 		}
// 	});
// });

// app.post("/campgrounds", (req, res) => {
// 	var name = req.body.name;
// 	var image = req.body.image;
// 	var description = req.body.description;
// 	var newObj = {name: name, image:image, description: description};

// 	Campground.create(newObj, (err, camp) => {
// 		if(err) console.log(err);
// 		else res.redirect("/campgrounds");
// 	});

// });

// app.get("/campgrounds/new", (req, res) => {
// 	res.render("campground/new");
// });

// app.get("/campgrounds/:id", (req, res) => {
// 	var id = req.params.id;
// 	Campground.findById(id).populate("comments").exec( (err, foundItem) =>{
// 		if(err) console.log(err);
// 		else {
// 				console.log(foundItem);
// 				res.render("campground/show", {item:foundItem});
// 		}
// 	});
// });

// // ---------------
// // COMMENTS ROUTES
// // ---------------
// app.get("/campgrounds/:id/comments/new",isLoggedIn, (req, res) => {
// 	Campground.findById(req.params.id, function (err, campground) {
// 		if(err) console.log(err);	
// 		else 
// 		{
// 			console.log(campground);
// 			res.render("comment/new", {campground: campground});
// 		}
// 	});
// });

// app.post("/campgrounds/:id/comments", isLoggedIn, (req, res) => {
// 		Campground.findById(req.params.id, function (err, campground) {
// 		if(err) {
// 			console.log(err);
// 			res.redirect("/campogrunds");
// 		}
// 		else 
// 		{
// 			Comment.create(req.body.comment, (error, comment) =>{
// 				if(error) console.log(error);
// 				else{
// 					console.log(campground);
// 					campground.comments.push(comment);
// 					campground.save();
// 					res.redirect("/campgrounds/" + campground._id);
// 				}	
// 			});
// 		}
// 	});
// });


// // ---------------
// // AUTH ROUTES
// // ---------------
// // REGISTER

// app.get("/register", (req, res) => {
// 	res.render("register");
// });

// app.post("/register", (req, res) => {
// 	var newUser = new User({username : req.body.username});
// 	User.register(newUser, req.body.password, (err, user) => {
// 		if(err){
// 			console.log(err);
// 			res.render("register");
// 		} 
// 	    passport.authenticate('local');
// 		res.redirect('/campgrounds');

// 	});	
// });


// // LOGOUT
// app.get("/logout", (req, res) => {
// 	req.logout();
// 	res.redirect("/campgrounds");
// });


// // LOGIN
// app.get("/login", (req, res) =>{
// 	res.render("login");
// });

// app.post("/login", passport.authenticate('local', { successRedirect: '/campgrounds',
// 							   failureRedirect: '/login' }),
// 	(req, res) => {

// });

// // ERROR PAGE
// app.get("*", (req, res) =>{
// 	res.send("Sorry wrong page");
// });


// function isLoggedIn(req, res, next){
// 	if(req.isAuthenticated()){
// 		return next();
// 	}
// 	res.redirect("/login");
// }


app.listen(3000, () => {
	console.log("server listening on port 3000");
});


