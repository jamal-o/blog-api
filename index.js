const app = require("./app");
const database = require("./db");
const dotenv = require("dotenv");

dotenv.config();

database.connectDB();

const port = process.env.PORT || 3000;

app.listen(port, () => {
	console.log(`Server started http://localhost:${port}`);
});
