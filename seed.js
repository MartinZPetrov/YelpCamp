var Campground = require("./model/campgrounds");
var Comment = require("./model/comments");

var campgrounds = [
	{
		name: "wonderland",
		image: "https://images.unsplash.com/photo-1563427777882-8c6e10fa4920?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
		description: "dqdo dobri e dobar i zul"
	},
	{
		name: "disney",
		image: "https://images.unsplash.com/photo-1563443744127-b607b02694f9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
		description: "gospod e velik i izqshten"
	}
];


async function seedDB() {
	try {
		await Campground.deleteMany({});
		await Comment.deleteMany({});
		for (const camps of campgrounds) {
			let campground = await Campground.create(camps);
			let comment = await Comment.create(
				{
					text: "This is a greate place to write text",
					author: { name: "Saint Luther" }
				});

			campground.comments.push(comment);
			campground.save();
		}
	} catch (error) {
		console.log(error);
	}
}
module.exports = seedDB;