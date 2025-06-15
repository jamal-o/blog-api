const blogRouter = require("express").Router();
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;

const UserModel = require("../models/user");
const ensureLoggedIn = require("../auth/auth.middleware");
const blogController = require("./blog.controller");

const { JWTstrategy, ExtractJwt } = require("passport-jwt");

const { articleValidator } = require("./blog.middleware");



blogRouter.get("/", blogController.fetchArticlesController);

blogRouter.get("/read/:id", blogController.fetchArticleController);


blogRouter.use(passport.authenticate("jwt", { session: false }));

blogRouter.get("/user", blogController.fetchUserArticlesController);

blogRouter.post("/", articleValidator, blogController.createArticleController);

blogRouter.post("/publish/:id", blogController.publishArticleController);

blogRouter.patch(
	"/:id",
	articleValidator,
	blogController.updateArticleController
);

blogRouter.delete("/:id", blogController.deleteArticleController);

module.exports = blogRouter;
