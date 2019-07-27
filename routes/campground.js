var express = require("express");
var router = express.Router();
var Campground = require("../model/campgrounds");
var User = require("../model/users");
var middleWare = require("../middleware");
var multer = require('multer');
var Notification = require("../model/notifications");
var cloudinary = require('cloudinary');
var Review = require("../model/reviews");

var storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});

var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

var upload = multer({ storage: storage, fileFilter: imageFilter });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API,
    api_secret: process.env.CLOUDINARY_SECRET
});

router.get("/", (req, res) => {
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    Campground.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
        Campground.count().exec(function (err, count) {
            if (err) {
                console.log(err);
            } else {
                res.render("campground/campgrounds", {
                    campgrounds: allCampgrounds,
                    current: pageNumber,
                    pages: Math.ceil(count / perPage)
                });
            }
        });
    });

    // if (req.query.search) {
    //     const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    //     Campground.find({ name: regex }, function (err, camp) {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             res.render("campground/campgrounds", { campgrounds: camp });
    //         }
    //     });
    // } else {
    //     Campground.find({}, function (err, camp) {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             res.render("campground/campgrounds", { campgrounds: camp });
    //         }
    //     });
    // }
});

router.post("/", middleWare.isLoggedIn, async (req, res) => {
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var price = req.body.price;
    var author = { id: req.user._id, name: req.user.username };
    var newObj = { name: name, image: image, price: price, description: description, author: author };

    try {
        let campground = await Campground.create(newObj);
        let user = await User.findById(req.user._id).populate("followers").exec();
        let newNotification = {
            username: req.user.username,
            campgroundId: campground.id
        }
        for (const follower of user.followers) {
            let notification = await Notification.create(newNotification);
            follower.notifications.push(notification);
            follower.save();
        }
        res.redirect("/campgrounds/" + campground.id)

    } catch (error) {
        req.flash("error", error.message);
        res.redirect("back");
    }
});

// Campground Like Route
router.post("/:id/like", middleWare.isLoggedIn, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampground) {
        if (err) {
            console.log(err);
            return res.redirect("/campgrounds");
        }

        // check if req.user._id exists in foundCampground.likes
        var foundUserLike = foundCampground.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            // user already liked, removing like
            foundCampground.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundCampground.likes.push(req.user);
        }

        foundCampground.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/campgrounds");
            }
            return res.redirect("/campgrounds/" + foundCampground._id);
        });
    });
});

router.get("/new", middleWare.isLoggedIn, (req, res) => {
    res.render("campground/new");
});

router.get("/:id", middleWare.isLoggedIn, (req, res) => {
    var id = req.params.id;
    Campground.findById(id).populate("comments likes reviews").exec((err, foundItem) => {
        if (err) console.log(err);
        else {
            console.log(foundItem);
            res.render("campground/show", { campground: foundItem });
        }
    });
});

// EDIT
router.get("/:id/edit", middleWare.isLoggedIn, (req, res) => {
    Campground.findById(req.params.id, function (err, foundCampground) {
        res.render("campground/edit", { item: foundCampground });
    });
});

// DELETE
router.delete("/:id", middleWare.checkCampgroundOwnerShip, (req, res) => {
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            // deletes all comments associated with the campground
            Comment.remove({ "_id": { $in: campground.comments } }, function (err, comment) {
                if (err) {
                    console.log(err);
                    return res.redirect("/campgrounds");
                }
                // deletes all reviews associated with the campground
                Review.remove({ "_id": { $in: campground.reviews } }, function (err, review) {
                    if (err) {
                        console.log(err);
                        return res.redirect("/campgrounds");
                    }
                    //  delete the campground
                    campground.remove();
                    req.flash("success", "Campground deleted successfully!");
                    res.redirect("/campgrounds");
                });
            });
        }
    });

});

//EDIT
router.put("/:id", middleWare.checkCampgroundOwnerShip, (req, res) => {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updated) => {
        res.redirect("/campgrounds/" + req.params.id);
    });
});


// IMAGE FILE UPLOAD
// router.post("/", middleWare.isLoggedIn, upload.single('image'), function (req, res) {
//     cloudinary.uploader.upload(req.file.path, function (result) {
//         // add cloudinary url for the image to the campground object under image property
//         req.body.campground.image = result.secure_url;
//         // add author to campground
//         req.body.campground.author = {
//             id: req.user._id,
//             username: req.user.username
//         }
//         Campground.create(req.body.campground, function (err, campground) {
//             if (err) {
//                 req.flash('error', err.message);
//                 return res.redirect('back');
//             }
//             res.redirect('/campgrounds/' + campground.id);
//         });
//     });
// });

// SEARCH
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;