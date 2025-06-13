const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.DB_CONNECTION_STRING, );
		console.log("Database connected");
	} catch (err) {
		console.error(err.message);
	}
};

module.exports = {
	connectDB,
};
