var mongoose = require("mongoose");
var Campground = require("./model/campgrounds");
var Comment = require("./model/comments");

var data = 	[
		{	name: "wonderland", 
			image: "https://images.unsplash.com/photo-1563427777882-8c6e10fa4920?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
			description: "dqdo dobri e dobar i zul"
		},
		{ 
			name: "disney",
			image: "https://images.unsplash.com/photo-1563443744127-b607b02694f9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
			description: "gospod e velik i izqshten"
		}
			];


function seedDB() {
	Campground.remove({}, (err, item) => {
		if(err) console.log(err);
		else console.log("You will be removed");
		
		data.forEach((seed) => {
			if(err) console.log(err);
			else 
				Campground.create(seed, (err, campground) => {
					if(err) console.log(err);
					else 
						console.log("added a campground");
					Comment.create(
						{
							text: "This is a place to learn",
							author: "TIM"
						}, (err , comment) => {
							if(err) console.log(err);
							else {
								campground.comments.push(comment);
								campground.save();
								console.log("Created a new comment");
							}
						});
				});
		});
	});
}

module.exports = seedDB;