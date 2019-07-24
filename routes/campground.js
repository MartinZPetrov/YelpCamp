var express = require("express");
var router = express.Router();
var Campground = require("../model/campgrounds");
var middleWare = require("../middleware");


router.get("/", (req, res) => {
    var user = req.user;
    Campground.find({}, function (err, camp) {
        if (err) {
            console.log(err);
        } else {
            res.render("campground/campgrounds", { campgrounds: camp });
        }
    });
});

router.post("/", middleWare.isLoggedIn, (req, res) => {
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var price = req.body.price;
    var author = { id: req.user._id, name: req.user.username };
    var newObj = { name: name, image: image, price: price, description: description, author: author };

    Campground.create(newObj, (err, camp) => {
        if (err) console.log(err);
        else res.redirect("/campgrounds");
    });

});

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

module.exports = router;