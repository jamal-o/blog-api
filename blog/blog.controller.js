const {
	fetchArticles,
	fetchArticle,
	createArticle,
	updateArticle,
	deleteArticle,
} = require("./blog.service");

const UserModel = require("../models/user");
/// fetch all articles
/// filter by author, title, tags, state
/// paginate default 20 per page
/// orderable by read_count, reading_time and timestamp
async function fetchArticlesController(req, res) {
	try {
		let { author, title, tags, state } = req.query;

		let articles = await fetchArticles({
			filter: {
				...(author && { author: author }),
				...(title && { title: title }),
				...(tags && { tags: tags }),
				...(state && { state: state }),
			},
			sort: req.query.sort,
			asc: req.query.asc ?? "asc",
			page: req.query.page ?? 1,
			pageSize: req.query.pageSize ?? 20,
		});
		res.json(articles);
	} catch (error) {
		console.error(error);
		res.status(500).send({
			message: "Something went wrong",
		});
	}
}

/// fetch user articles
async function fetchUserArticlesController(req, res) {
	try {
		//user
		let authorId = req.user._id; //TODO:
		let { title, tags, state } = req.query;
		let articles = await fetchArticles({
			filter: {
				...(authorId && { authorId: authorId }),
				...(title && { title: title }),
				...(tags && { tags: tags }),
				...(state && { state: state }),
			},
			sort: req.query.sort,
			page: req.query.page ?? 1,
			pageSize: req.query.pageSize ?? 20,
		});

		res.send(articles);
	} catch (error) {
		console.error(error);
		res.status(500).send({
			message: "Something went wrong",
		});
	}
}

/// fetch single article
/// return article and author information
/// update read count by 1 also
async function fetchArticleController(req, res) {
	try {
		let article = await fetchArticle({
			articleId: req.params.id,
		});

		let author = await UserModel.findById(article.authorId, {
			_id: 0,
			first_name: 1,
			last_name: 1,
			email: 1,
		});

		res.send({ blog: article, author });
	} catch (error) {
		console.error(error);
		res.status(500).send({
			message: "Something went wrong",
		});
	}
}

/// create article
/// - only logged in users can create
/// - default state draft
async function createArticleController(req, res) {
	try {
		let article = await createArticle({
			article: req.body,
			userId: req.user._id,
		});
		res.status(201).json({
			id: article._id,
			title: article.title,
			description: article.description,
			tags: article.tags,
			state: article.state,
			timestamp: article.timestamp,
			state: article.state,
			timestamp: article.timestamp,
			read_count: article.read_count,
			reading_time: article.reading_time,
			body: article.body,
			updatedAt: article.updatedAt,
		});
	} catch (error) {
		console.error(error);
		res.status(500).send({
			message: "Something went wrong",
		});
	}
}

/// update article
/// - only logged in users can update
/// - only owner can update article
async function updateArticleController(req, res) {
	try {
		let result = await updateArticle({
			article: req.body,
			articleId: req.params.id,
			userId: req.user._id,
		});
		res.json(result);
	} catch (error) {
		console.error(error);
		res.status(500).send({
			message: "Something went wrong",
		});
	}
}

/// delete article
/// - only logged in users can delete
/// - only owner can delete

async function deleteArticleController(req, res) {
	try {
		await deleteArticle({ articleId: req.params.id });
		res.send({message: "Article deleted successfully"});
	} catch (error) {
		console.error(error);
		res.status(500).send({
			message: "Something went wrong",
		});
	}
}

module.exports = {
	fetchArticlesController,
	fetchUserArticlesController,
	fetchArticleController,
	createArticleController,
	updateArticleController,
	deleteArticleController,
};
