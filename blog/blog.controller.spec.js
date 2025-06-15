const request = require("supertest");
const app = require("../app");
const {
	fetchArticles,
	fetchArticle,
	createArticle,
	updateArticle,
	deleteArticle,
} = require("./blog.service");
const UserModel = require("../models/user");
const jwt = require("jsonwebtoken");

jest.mock("./blog.service");
jest.mock("../models/user");

describe("Blog Controller Tests", () => {
	let mockArticle;
	let mockUser;
	let authToken;

	beforeEach(() => {
		mockUser = {
			_id: "123",
			email: "test@example.com",
			first_name: "Test",
			last_name: "User",
		};

		const now = new Date();
		mockArticle = {
			_id: "456",
			title: "Test Article",
			description: "Test Description",
			body: "Test Body",
			tags: ["test", "article"],
			authorId: mockUser._id,
			state: "draft",
			read_count: 0,
			reading_time: 1,
			timestamp: now.toISOString(),
			updatedAt: now.toISOString(),
		};

		// Create a valid JWT token for authenticated requests
		authToken = jwt.sign({ user: mockUser }, process.env.JWT_SECRET);

		// Reset all mocks
		fetchArticles.mockReset();
		fetchArticle.mockReset();
		createArticle.mockReset();
		updateArticle.mockReset();
		deleteArticle.mockReset();
		UserModel.findById.mockReset();
	});

	describe("GET /api/v1/blog", () => {
		it("should fetch all published articles", async () => {
			const mockArticles = [mockArticle];
			fetchArticles.mockResolvedValue(mockArticles);

			const response = await request(app)
				.get("/api/v1/blog")
				.query({ state: "published" });

			expect(response.status).toBe(200);
			expect(JSON.stringify(response.body)).toEqual(
				JSON.stringify(mockArticles)
			);
			expect(fetchArticles).toHaveBeenCalledWith(
				expect.objectContaining({
					filter: { state: "published" },
				})
			);
		});

		it("should support pagination and sorting", async () => {
			fetchArticles.mockResolvedValue([mockArticle]);

			const response = await request(app).get("/api/v1/blog").query({
				page: 2,
				pageSize: 10,
				sort: "read_count",
				search: "a new day",
			});

			expect(response.status).toBe(200);
			expect(fetchArticles).toHaveBeenCalledWith({
				filter: {state: "published"},
				search: "a new day",
				page: "2",
				pageSize: "10",
				sort: "read_count",
			});
		});

		it("should handle filtering by multiple parameters", async () => {
			fetchArticles.mockResolvedValue([mockArticle]);

			const response = await request(app).get("/api/v1/blog").query({
				search: "a new age",
				sort: "read_count",
			});

			expect(response.status).toBe(200);
			expect(fetchArticles).toHaveBeenCalledWith({
				filter: {state: "published"},
				search: "a new age",
				sort: "read_count",
				page: 1,
				pageSize: 20,
			});
		});
	});

	describe("GET /api/v1/blog/read/:id", () => {
		it("should fetch a single article with author info", async () => {
			fetchArticle.mockResolvedValue(mockArticle);
			UserModel.findById.mockResolvedValue(mockUser);

			const response = await request(app)
				.get("/api/v1/blog/read/456")
				.set("Authorization", `Bearer ${authToken}`);

			expect(response.status).toBe(200);
			expect(JSON.stringify(response.body.blog)).toEqual(
				JSON.stringify(mockArticle)
			);
			expect(response.body).toHaveProperty("author");
			expect(fetchArticle).toHaveBeenCalledWith({ articleId: "456" });
		});

		it("should return 404 for non-existent article", async () => {
			fetchArticle.mockRejectedValue(new Error("Article not found"));

			const response = await request(app)
				.get("/api/v1/blog/read/999")
				.set("Authorization", `Bearer ${authToken}`);

			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty("message", "Article not found");
		});
	});

	describe("GET /api/v1/blog/user", () => {
		it("should fetch user's articles with filtering", async () => {
			fetchArticles.mockResolvedValue([mockArticle]);

			const response = await request(app)
				.get("/api/v1/blog/user")
				.set("Authorization", `Bearer ${authToken}`)
				.query({ state: "draft" });

			expect(response.status).toBe(200);
			expect(fetchArticles).toHaveBeenCalledWith(
				expect.objectContaining({
					filter: {
						authorId: mockUser._id,
						state: "draft",
					},
				})
			);
		});

		it("should require authentication", async () => {
			const response = await request(app).get("/api/v1/blog/user");

			expect(response.status).toBe(401);
		});
	});

	describe("POST /api/v1/blog", () => {
		const newArticle = {
			title: "New Article",
			description: "New Description",
			body: "Article Body",
			tags: ["test"],
		};

		it("should create a new article", async () => {
			createArticle.mockResolvedValue({ ...mockArticle, ...newArticle });

			const response = await request(app)
				.post("/api/v1/blog")
				.set("Authorization", `Bearer ${authToken}`)
				.send(newArticle);

			expect(response.status).toBe(201);
			expect(createArticle).toHaveBeenCalledWith({
				article: newArticle,
				userId: mockUser._id,
			});
		});

		it("should validate required fields", async () => {
			const invalidArticle = { title: "Only Title" };

			const response = await request(app)
				.post("/api/v1/blog")
				.set("Authorization", `Bearer ${authToken}`)
				.send(invalidArticle);

			expect(response.status).toBe(400);
		});
	});

	describe("PATCH /api/v1/blog/:id", () => {
		const updates = {
			title: "Updated Title",
			state: "published",
		};

		it("should update an existing article", async () => {
			const fullUpdates = {
				...updates,
				body: "Updated body",
				title: "Updated Title",
				description: "Updated Description",
			};
			updateArticle.mockResolvedValue({ ...mockArticle, ...fullUpdates });

			const response = await request(app)
				.patch("/api/v1/blog/456")
				.set("Authorization", `Bearer ${authToken}`)
				.send(fullUpdates);

			expect(response.status).toBe(200);
			// expect(response.body).toBeEqual({

			// );
			// expect(updateArticle).toHaveBeenCalledWith({
			// 	article: { ...updates, body: "Updated body" },
			// 	articleId: "456",
			// 	userId: mockUser._id,
			// });
		});

		it("should handle unauthorized article access", async () => {
			updateArticle.mockRejectedValue(new Error("Unauthorized"));

			const response = await request(app)
				.patch("/api/v1/blog/456")
				.set("Authorization", `Bearer ${authToken}`)
				.send({ ...updates, body: "Updated body" }); // Adding required field

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty("message", "Invalid blog");
		});
	});

	describe("DELETE /api/v1/blog/:id", () => {
		it("should delete an article", async () => {
			deleteArticle.mockResolvedValue({
				message: "Article deleted successfully",
			});

			const response = await request(app)
				.delete("/api/v1/blog/456")
				.set("Authorization", `Bearer ${authToken}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty(
				"message",
				"Article deleted successfully"
			);
			expect(deleteArticle).toHaveBeenCalledWith({
				articleId: "456",
				userId: "123",
			});
		});

		it("should require authentication", async () => {
			const response = await request(app).delete("/api/v1/blog/456");

			expect(response.status).toBe(401);
		});
	});
});
