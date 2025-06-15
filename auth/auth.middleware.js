const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const UserModel = require("../models/user");

const JWTstrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;

const jwt = require("jsonwebtoken");
const joi = require("joi");
require("dotenv").config();

passport.use(
	new JWTstrategy(
		{
			secretOrKey: process.env.JWT_SECRET,
			// jwtFromRequest: ExtractJWT.fromUrlQueryParameter('secret_token')
			jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(), // Use this if you are using Bearer token
		},
		async (token, done) => {
			try {
				return done(null, token.user);
			} catch (error) {
				done(error);
			}
		}
	)
);

// This middleware authenticates the user based on the email and password provided.
// If the user is found, it sends the user information to the next middleware.
// Otherwise, it reports an error.
passport.use(
	"login",
	new localStrategy(
		{
			usernameField: "email",
			passwordField: "password",
		},
		async (email, password, done) => {
			try {
				const user = await UserModel.findOne({ email });

				if (!user) {
					return done(null, false, { message: "User not found" });
				}

				const validate = await user.isValidPassword(password);

				if (!validate) {
					return done(null, false, { message: "Wrong Password" });
				}

				return done(null, user, { message: "Logged in Successfully" });
			} catch (error) {
				return done(error);
			}
		}
	)
);

function loginMiddleware(req, res, next) {
	const schema = joi.object({
		email: joi.string().email().required(),
		password: joi.string().required(),
	});

	const { error, value } = schema.validate(req.body);
	if (error) {
		return res.status(400).send({
			message: "Invalid login credentials",
			error: error.message,
		});
	}
	passport.authenticate("login", async (err, user, info) => {
		try {
			if (!user) {
				const error = new Error("Username or password is incorrect");
				return res.status(401).json({
					message: "Username or password is incorrect",
				});
			}

			if (err) {
				return next(err);
			}

			req.login(user, { session: false }, async (error) => {
				if (error) return next(error);

				const body = { _id: user._id, email: user.email };
				//You store the id and email in the payload of the JWT.
				// You then sign the token with a secret or key (JWT_SECRET), and send back the token to the user.
				// DO NOT STORE PASSWORDS IN THE JWT!
				const token = jwt.sign({ user: body }, process.env.JWT_SECRET, {
					expiresIn: "1Hr",
				});

				return res.json({ token });
			});
		} catch (error) {
			return next(error);
		}
	})(req, res, next);
}

async function signupMiddleware(req, res, next) {
	const schema = joi.object({
		first_name: joi.string().required(),
		last_name: joi.string().required(),
		email: joi.string().email().required(),
		password: joi.string().required(),
	});

	const { error, value } = schema.validate(req.body);
	if (error) {
		return res.status(400).send({
			message: "Invalid signup credentials",
			error: error.details,
		});
	}

	let { email, password, first_name, last_name } = req.body;
	try {
		const user = await UserModel.create({
			email,
			password,
			first_name,
			last_name,
		});
		req.user = user;
		next();
	} catch (error) {
		if (error?.code === 11000) {
			return res.status(400).send({
				message: "User with this email already exists",
			});
		}
		next(error);
	}
}
module.exports = { loginMiddleware, signupMiddleware };
