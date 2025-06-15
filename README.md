# Blogging API

A RESTful API for a blogging platform built with Node.js, Express, and MongoDB. This API allows users to create, publish, and manage blog posts, with features like authentication, pagination, and search capabilities.

## Features

### Authentication

- User signup and login functionality
- JWT-based authentication with 1-hour token expiration
- Protected routes for authenticated users

### Blog Management

- Create and manage blog posts in draft or published states
- Edit and delete capabilities for blog owners
- Personal blog list with pagination (default 20 posts per page)
- Filter blogs by state (draft/published)

### Public Access Features

- Read published blogs without authentication
- Search blogs by author, title, and tags
- Sort blogs by:
  - Read count
  - Reading time
  - Timestamp
- Automatic reading time calculation
- Read count tracking

## API Endpoints

### Authentication

- `POST /auth/signup` - Create a new user account
- `POST /auth/login` - Authenticate user and receive JWT token

### Blog Operations

- `GET /blog` - Get all published articles (public access)
- `GET /blog/:id` - Get a single article by ID
- `GET /blog/user` - Get all articles by logged-in user
- `POST /blog` - Create a new blog article (authenticated users only)
- `POST /blog/publish/:id` - Update article state to published (author only)
- `PATCH /blog/:id` - Update an existing article (author only)
- `DELETE /blog/:id` - Delete an article (author only)

## Data Models

### User

- email (required, unique)
- first_name (required)
- last_name (required)
- password

### Blog/Article

- title (required, unique)
- description
- author
- state (draft/published)
- read_count
- reading_time
- tags
- body (required)
- timestamp

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file with:
   ```
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. Run the application:
   ```bash
   npm start
   ```

## Testing

Run the test suite:

```bash
npm test
```

## API Documentation

A detailed Postman collection is available for testing and exploring the API endpoints:
[View API Documentation](https://www.postman.com/joint-operations-geoscientist-26235604/workspace/public/collection/36744366-647ea24d-60cf-478b-afc0-d73475a00948?action=share&creator=36744366)

## Technologies Used

- Node.js
- Express.js
- MongoDB
- JWT for authentication
- Jest for testing
