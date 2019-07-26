var express = require("express");
var router = express.Router();
var Campground = require("../model/campgrounds");
var User = require("../model/users");
var middleWare = require("../middleware");
var multer = require('multer');
var Notification = require("../model/notifications");
var cloudinary = require('cloudinary');

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


// CLOUDINARY_NAME=
// CLOUDINARY_API=736216711462878
// CLOUDINARY_SECRET=
cloudinary.config({
    cloud_name: "dnk0dpo7h",
    api_key: "736216711462878",
    api_secret: "H0JBbtcyVhKNU" 
});

router.get("/", (req, res) => {
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({ name: regex }, function (err, camp) {
            if (err) {
                console.log(err);
            } else {
                res.render("campground/campgrounds", { campgrounds: camp });
            }
        });
    } else {
        Campground.find({}, function (err, camp) {
            if (err) {
                console.log(err);
            } else {
                res.render("campground/campgrounds", { campgrounds: camp });
            }
        });
    }
});

// router.post("/", middleWare.isLoggedIn, async (req, res) => {
//     var name = req.body.name;
//     var image = req.body.image;
//     var description = req.body.description;
//     var price = req.body.price;
//     var author = { id: req.user._id, name: req.user.username };
//     var newObj = { name: name, image: image, price: price, description: description, author: author };

//     try {
//         let campground = await Campground.create(newObj);
//         let user = await User.findById(req.user._id).populate("followers").exec();
//         let newNotification = {
//             username: req.user.username,
//             campgroundId: campground.id
//         }
//         for (const follower of user.followers) {
//             let notification = await Notification.create(newNotification);
//             follower.notifications.push(notification);
//             follower.save();
//         }
//         res.redirect("/campgrounds/" + campground.id)

//     } catch (error) {
//         req.flash("error", error.message);
//         res.redirect("back");
//     }
// });

router.get("/new", middleWare.isLoggedIn, (req, res) => {
    res.render("campground/new");
});

router.get("/:id", middleWare.isLoggedIn, (req, res) => {
    var id = req.params.id;
    Campground.findById(id).populate("comments").exec((err, foundItem) => {
        if (err) console.log(err);
        else {
            console.log(foundItem);
            res.render("campground/show", { item: foundItem });
        }
    });
});


router.get("/:id/edit", middleWare.isLoggedIn, (req, res) => {
    var id = req.params.id;
    Campground.findById(req.params.id, function (err, foundCampground) {
        res.render("campground/edit", { item: foundCampground });
    });
});

// DELETE
router.delete("/:id", middleWare.checkCampgroundOwnerShip, (req, res) => {
    Campground.findByIdAndRemove(req.params.id, function (err, foundCampground) {
        if (err) {
            req.flash("error", err);
            res.redirect("/campgrounds");
        }
        else {
            if (req.user._id.equals(foundCampground.author.id))
                res.redirect("/campgrounds");
        }
    });
});


//EDIT
router.put("/:id", middleWare.checkCampgroundOwnerShip, (req, res) => {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updated) => {
        res.redirect("/campgrounds/" + req.params.id);
    });
});

router.post("/", middleWare.isLoggedIn, upload.single('image'), function (req, res) {
    cloudinary.uploader.upload(req.file.path, function (result) {
        // add cloudinary url for the image to the campground object under image property
        req.body.campground.image = result.secure_url;
        // add author to campground
        req.body.campground.author = {
            id: req.user._id,
            username: req.user.username
        }
        Campground.create(req.body.campground, function (err, campground) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            res.redirect('/campgrounds/' + campground.id);
        });
    });
});

// SEARCH
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;