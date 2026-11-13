# part4/bloglist - exercises 4.1-4.23

Blog list backend (Node.js + Express + Mongoose + MongoDB), with tests
using Vitest and Supertest. Full Stack Open, Part 4.

## What is implemented

- 4.1-4.2: blog list application, refactored into separate modules
  (`app.js`, `index.js`, `utils/config.js`, `utils/logger.js`,
  `utils/middleware.js`, `controllers/blogs.js`, `models/blog.js`).
- 4.3-4.7: helper functions in `utils/list_helper.js` - `dummy`,
  `totalLikes`, `favoriteBlog`, `mostBlogs`, `mostLikes` - with tests.
- 4.8-4.14: API tests with Supertest - getting blogs (JSON, `id` instead
  of `_id`), adding a blog, `likes` defaulting to 0, missing `title`/`url`
  returning 400, deleting a blog, updating a blog's likes.
- 4.15-4.17: user administration - `POST /api/users` (unique username,
  username and password at least 3 characters), `GET /api/users` with
  blogs populated, blogs referencing their creator.
- 4.18-4.21: token authentication - `POST /api/login` (jsonwebtoken),
  `tokenExtractor` and `userExtractor` middleware; adding a blog requires
  a token, deleting a blog requires a token and only its creator can
  delete it.
- 4.22-4.23: `tokenExtractor`/`userExtractor` are used by the blog
  routes; tests cover adding/deleting without a token and deleting
  another user's blog.

Note: Express 5 handles rejected promises in async route handlers
itself, so `express-async-errors` is not needed. Passwords are hashed
with `bcryptjs` (same API as `bcrypt`).

## Setup

Copy `.env.example` to `.env` and fill in the values:

```
MONGODB_URI=mongodb://127.0.0.1:27017/bloglist
TEST_MONGODB_URI=mongodb://127.0.0.1:27017/bloglist-test
SECRET=change-this-secret
PORT=3003
```

`.env` is never committed. `TEST_MONGODB_URI` is used when
`NODE_ENV=test`; a local MongoDB is enough for the tests (for example
`docker run -d -p 27017:27017 mongo:7`).

## Commands

```
npm install
npm start     # start the server (port 3003 by default)
npm run dev   # start with --watch
npm test      # run all tests (Vitest + Supertest), 36 tests
npm run lint  # ESLint
```
