const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const blogSchema = new Schema({
	authorId: { type: mongoose.ObjectId, required: true },
	title: { type: String, required: true, unique: true },
	description: { type: String, required: true },
	tags: { type: [String], required: true },
	state: { type: String, enum: ["draft", "published"], default: "draft" },
	timestamp: { type: Date, default: Date.now },
	read_count: { type: Number, default: 0 },
	reading_time: { type: Number, default: 0 },
	body: { type: String, required: true },
	updatedAt: { type: Date, default: Date.now },
});
blogSchema.index({ title: "text", tags: "text" });
blogSchema.pre("save", function (next) {
	if (this.body) {
		const wordCount = this.body.split(/\s+/).length;
		this.reading_time = wordCount / 200;
		// Average reading speed of 200 words per minute
	}
	next();
});

const BlogModel = mongoose.model("blogs", blogSchema);

module.exports = BlogModel;
