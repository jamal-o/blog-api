const request = require("supertest");
const app = require("../app");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

jest.mock("../models/user");

describe("Auth Controller Tests", () => {
	let mockUser;

	beforeEach(() => {
		mockUser = {
			_id: "123",
			email: "test@example.com",
			first_name: "Test",
			last_name: "User",
			isValidPassword: jest.fn(),
		};
		User.findOne = jest.fn();
		User.create = jest.fn();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("POST /api/v1/auth/signup", () => {
		const validSignupData = {
			email: "test@example.com",
			password: "password123",
			first_name: "Test",
			last_name: "User",
		};

		it("should create a new user successfully", async () => {
			User.create.mockResolvedValue(mockUser);

			const response = await request(app)
				.post("/api/v1/auth/signup")
				.send(validSignupData);

			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty("message", "Signup successful");
			expect(response.body).toHaveProperty("user");
			expect(User.create).toHaveBeenCalledWith(validSignupData);
		});

		it("should return 400 for invalid signup data", async () => {
			const invalidData = { email: "invalid" };

			const response = await request(app)
				.post("/api/v1/auth/signup")
				.send(invalidData);

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty(
				"message",
				"Invalid signup credentials"
			);
		});
	});

	describe("POST /api/v1/auth/login", () => {
		const validLoginData = {
			email: "test@example.com",
			password: "password123",
		};

		it("should login successfully with valid credentials", async () => {
			User.findOne.mockResolvedValue(mockUser);
			mockUser.isValidPassword.mockResolvedValue(true);

			const response = await request(app)
				.post("/api/v1/auth/login")
				.send(validLoginData);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("token");
			// Verify token structure
			const decodedToken = jwt.verify(
				response.body.token,
				process.env.JWT_SECRET
			);
			expect(decodedToken.user).toHaveProperty("_id", mockUser._id);
			expect(decodedToken.user).toHaveProperty("email", mockUser.email);
		});

		it("should return 400 for invalid login data", async () => {
			const invalidData = { email: "invalid" };

			const response = await request(app)
				.post("/api/v1/auth/login")
				.send(invalidData);

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty(
				"message",
				"Invalid login credentials"
			);
		});

		it("should return 401 for incorrect password", async () => {
			User.findOne.mockResolvedValue(mockUser);
			mockUser.isValidPassword.mockResolvedValue(false);

			const response = await request(app)
				.post("/api/v1/auth/login")
				.send(validLoginData);

			expect(response.status).toBe(401);
			expect(response.body).toHaveProperty(
				"message",
				"Username or password is incorrect"
			);
		});

		it("should return 401 for non-existent user", async () => {
			User.findOne.mockResolvedValue(null);

			const response = await request(app)
				.post("/api/v1/auth/login")
				.send(validLoginData);

			expect(response.status).toBe(401);
			expect(response.body).toHaveProperty(
				"message",
				"Username or password is incorrect"
			);
		});
	});
});
