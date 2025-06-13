var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const blogRouter = require("./blog/blog.router");
const authRouter = require("./auth/auth.router");
const hbs = require("hbs");
// var ClientJWTBearerStrategy = require("passport-oauth2-jwt-bearer").Strategy;

var app = express();

// view engine setup
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
hbs.registerPartials(path.join(__dirname, 'views/partials'));


app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Routers
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/blog", blogRouter);
app.get("/", (req, res) => {
	res.render("home");
});

/// Error handlers

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	// next(createError(404));
	res.status(404).render("404");
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	console.error("Error Handler" + err);
	
	res
		.status(err.status || 500)
		.send({ message: err.message || "Internal Server Error" });
	
});

module.exports = app;
