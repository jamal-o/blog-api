const joi = require("joi");

function articleValidator(req, res, next) {
	const schema = joi.object({
		title: joi.string().required(),
		description: joi.string().required(),
		tags: joi.array(),
		state: joi.string().valid("draft", "published"),
		body: joi.string().required(),
	});

	const { error, value } = schema.validate(req.body);
	if (error) {
		return res.status(400).send({
			message: "Invalid blog",
			error: error.message,
		});
	}

	next();
}

module.exports = { articleValidator };
