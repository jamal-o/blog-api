const BlogModel = require("../models/blog");

const projection = {
	_id: 1,
	authorId: 1,
	title: 1,
	description: 1,
	tags: 1,
	state: 1,
	timestamp: 1,
	read_count: 1,
	reading_time: 1,
	body: 1,
	updatedAt: 1,
};
async function fetchArticles({ filter, sort, page, pageSize, asc }) {
	return BlogModel.find(filter, projection, {
		...(sort && { sort: sort }),
		skip: (page - 1) * pageSize,
		limit: pageSize,
	}).exec();
}

async function fetchArticle({ articleId }) {
	return BlogModel.findOneAndUpdate(
		{ _id: articleId },
		{ $inc: { read_count: 1 } },
		{
			new: true,
			projection: projection,
		}
	).exec();
}

async function createArticle({ article, userId }) {
	article.authorId = userId;
	let result = await BlogModel.create(article);
	return result; //TODO: select fields
}

async function updateArticle({ article, userId, articleId }) {
	return await BlogModel.findOneAndUpdate(
		{ _id: articleId, authorId: userId },
		article,
		{
			new: true,
			projection: projection,
		}
	);
}

async function deleteArticle({ articleId }) {
	let deleteCount = await BlogModel.deleteOne({ _id: articleId });
	if (deleteCount.deletedCount === 0) {
		throw new Error("article not found");
	}
	return;
}

module.exports = {
	fetchArticles,
	fetchArticle,
	createArticle,
	updateArticle,
	deleteArticle,
};
