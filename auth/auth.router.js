const { sign } = require("jsonwebtoken");
const authMiddleWare = require("./auth.middleware");

const authRouter = require("express").Router();
const hbs = require("hbs");

authRouter.get("/login", (req, res) => {
	res.render("login");
});

authRouter.get("/signup", (req, res) => {
	res.render("signup");
});

authRouter.post("/login", authMiddleWare.loginMiddleware, (req, res) => {
	//Middleware handles everything
});

authRouter.post("/signup", authMiddleWare.signupMiddleware, (req, res) => {
	res.status(201).json({
		message: "Signup successful",
		user: {
			id: req.user.id,
			first_name: req.user.first_name,
			last_name: req.user.last_name,
			email: req.user.email,
		},
	});
});

module.exports = authRouter;
