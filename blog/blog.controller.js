const {
	fetchArticles,
	fetchArticle,
	createArticle,
	updateArticle,
	deleteArticle,
} = require("./blog.service");

const UserModel = require("../models/user");
/// fetch all articles
/// paginate default 20 per page
/// orderable by read_count, reading_time and timestamp
/// searchable by title, author and tags
async function fetchArticlesController(req, res) {
	try {
		let { search } = req.query;

		// Get sort options
		let sortOptions = [
			"read_count",
			"read_count_desc",
			"timestamp",
			"timestamp_desc",
			"reading_time",
			"reading_time_desc",
		];
		let sort = sortOptions.includes(req.query.sort) ? req.query.sort : null;
		// if ends in "_desc" remove the string and append "-" to the start of the string
		if (sort && sort.endsWith("_desc")) {
			sort = "-" + sort.slice(0, -5);
			console.log(sort);
		}

		let articles = await fetchArticles({
			filter: {
				state: "published",
			},
			search: search ?? null,
			sort: sort,
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
// - only owner can fetch
//
async function fetchUserArticlesController(req, res) {
	try {
		let authorId = req.user._id;
		let { state } = req.query;
		let articles = await fetchArticles({
			filter: {
				authorId: authorId,
				...(state && { state: state }),
			},
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
		if (error.message === "Article not found") {
			return res.status(404).send({
				message: "Article not found",
			});
		}
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

		if (error?.code === 11000) {
			return res.status(400).send({
				message: "Article with same title already exists",
			});
		}
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

/// update article
/// - only logged in users can update
/// - only owner can update article
async function publishArticleController(req, res) {
	try {
		let result = await updateArticle({
			article: { state: "published" },
			articleId: req.params.id,
			userId: req.user._id,
		});
		res.status(200).json({ message: "Article published successfully" });
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
		await deleteArticle({ articleId: req.params.id, userId: req.user._id });
		res.send({ message: "Article deleted successfully" });
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
	publishArticleController,
	deleteArticleController,
};
