const blogRouter = require("express").Router();
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;

const UserModel = require("../models/user");
const ensureLoggedIn = require("../auth/auth.middleware");
const blogController = require("./blog.controller");

const { JWTstrategy, ExtractJwt } = require("passport-jwt");

const { articleValidator } = require("./blog.middleware");



blogRouter.get("/", blogController.fetchArticlesController);

blogRouter.use(passport.authenticate("jwt", { session: false }));

blogRouter.get("/user", blogController.fetchUserArticlesController);

blogRouter.get("/:id", blogController.fetchArticleController);


blogRouter.post("/", articleValidator, blogController.createArticleController);

blogRouter.patch(
	"/:id",
	articleValidator,
	blogController.updateArticleController
);

blogRouter.delete("/:id", blogController.deleteArticleController);

module.exports = blogRouter;
