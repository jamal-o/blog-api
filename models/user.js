const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const bcrypt = require("bcrypt");

const userSchema = new Schema({
	first_name: { type: String, required: true },
	last_name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: {
		type: String,
		required: true,
	},
});

userSchema.pre("save", async function (next) {
	const user = this;
	const hash = await bcrypt.hash(this.password, 10);

	this.password = hash;
	next();
});

userSchema.index({ first_name: "text", last_name: "text" });

userSchema.methods.isValidPassword = async function (password) {
	const user = this;
	const compare = await bcrypt.compare(password, user.password);

	return compare;
};

const UserModel = mongoose.model("users", userSchema);

module.exports = UserModel;
