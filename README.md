<a id="readme-top"></a>

<div align="center">

# My Personal Blog

<p>
  <a href="https://github.com/Sahil-Basumatary/personal-blog/actions/workflows/ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/Sahil-Basumatary/personal-blog/ci.yml?branch=main&style=for-the-badge&label=Tests" alt="Tests">
  </a>
  <a href="https://github.com/Sahil-Basumatary/personal-blog/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License: MIT">
  </a>
  <a href="https://linkedin.com/in/sahil-basumatary">
    <img src="https://img.shields.io/badge/-LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn">
  </a>
</p>

A full-stack personal journal where I write about computer science, life in London, technical tools and my journey of learning in public.

</div>

### Tech Stack

| Area           | Stack |
| -------------- | ----- |
| **Backend**    | [![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/) [![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express)](https://expressjs.com/) [![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/) [![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/) |
| **Frontend**   | [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/) [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/) [![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)](https://reactrouter.com/) |
| **Infrastructure** | [![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/features/actions) [![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/) [![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/) |

## Technical Highlights

**What I have learned throughout building this:**

- **Testing Strategy** - Implemented integration tests with mongodb-memory-server. Each test runs against an isolated in-memory database, ensuring tests don't interfere with each other. Used Supertest to test HTTP endpoints without starting the actual server.

- **Authentication Architecture** - Integrated Clerk with a custom owner-only guard. In production, Clerk middleware handles JWT validation and in tests, a mock middleware injects test user IDs for deterministic testing.

- **Performance Optimization** - Implemented server side pagination with limit capping (max 20 items) to prevent abuse. Used `Promise.all()` to parallelize post fetching and count queries, cutting response time in half.

- **Slug-based Routing** - Generated SEO-friendly slugs from post titles with collision detection. Posts can be accessed by MongoDB ObjectId OR slug, with graceful fallback between the two.

- **CI/CD Pipeline** - GitHub Actions workflow runs tests on every push. Prevents merging broken code to main. Automated client build verification catches build errors early.

## Architecture

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (React SPA)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  HomePage   │  │  BlogPage   │  │ SinglePost  │  │ NewPost/EditPost│  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘  │
│         └────────────────┴────────────────┴──────────────────┘           │
│                                   │                                      │
│                          src/api/posts.js                                │
└──────────────────────────────────┬───────────────────────────────────────┘
                                   │ HTTP (REST)
                                   ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                            SERVER (Express API)                          │
│                                                                          │
│  ┌────────────────┐    ┌────────────────┐    ┌────────────────────────┐  │
│  │  Rate Limiter  │───▶│  Clerk Auth    │───▶│  postsController.js    │  │
│  │  (20 writes/m) │    │  (JWT verify)  │    │  CRUD + views + votes  │  │
│  └────────────────┘    └────────────────┘    └───────────┬────────────┘  │
│                                                          │               │
│                                                   Mongoose ODM           │
└──────────────────────────────────────────────────────────┬───────────────┘
                                                           │
                                                           ▼
                                                ┌────────────────────┐
                                                │   MongoDB Atlas    │
                                                │   (posts, votes,   │
                                                │    view counts)    │
                                                └────────────────────┘

```

## Project Structure

```
personal-blog/
├── client/                    # React SPA
│   ├── src/
│   │   ├── api/               # API client (fetchPosts, createPost, etc.)
│   │   ├── components/        # Reusable UI (HeroSection, Footer, UserChip)
│   │   ├── pages/             # Route-level components
│   │   └── config/            # Auth and environment config
│   └── public/
│
├── server/                    # Express API
│   ├── src/
│   │   ├── controllers/       # Business logic (postsController.js)
│   │   ├── models/            # Mongoose schemas (Post)
│   │   ├── routes/            # Route definitions (/api/posts)
│   │   ├── middleware/        # Auth, rate limiting
│   │   ├── db/                # MongoDB connection
│   │   └── tests/             # Jest + supertest API tests
│   │   ├── docs/              # API docs (OpenAPI 3.0 spec)
│   │   │   └── openapi.yaml   # OpenAPI spec used by Swagger UI
│   └── package.json
│
├── blog/                      # Static Jekyll content 
└── .github/workflows/         # CI pipeline

```
## Features

### Owner-Only Writing Experience
- Authenticated via Clerk with dedicated OWNER_USER_ID guard
- Create, edit, and delete posts from a user friendly writing UI
- Local draft autosave 
- SEO-friendly slug generation with collision handling

### Search and Discovery
- Full-text search across title, excerpt, and content using case-insensitive regex
- Fuzzy search with typo tolerance (1-char mismatch)
- Category filters 
- Paginated results with configurable page size (1–20, default is 5)

### Blog Reading Experience
- Featured post highlight on the main blog page
- Reading progress bar on individual posts
- View counter (backend source of truth with local fallback)
- Mobile-responsive design with simple top navigation

### Engagement
- Per-post upvote/downvote system
- Toggleable backend vote system 
- Login-gated voting to prevent spam

### Security & Reliability
- Rate limiting: 20 writes/min, 60 votes/min per IP
- Input validation and sanitization on all endpoints
- Proper HTTP status codes (400, 401, 403, 404, 429, 500)
- Error handling throughout the stack

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/posts` | Public | List posts (paginated, searchable, filterable) |
| `GET` | `/api/posts/:idOrSlug` | Public | Get single post by ID or slug |
| `POST` | `/api/posts` | Owner | Create new post |
| `PUT` | `/api/posts/:idOrSlug` | Owner | Update existing post |
| `DELETE` | `/api/posts/:idOrSlug` | Owner | Delete post |
| `POST` | `/api/posts/:idOrSlug/view` | Public | Increment view count |
| `POST` | `/api/posts/:idOrSlug/vote` | Logged in | Upvote or downvote (`{ direction: "up" \| "down" }`) |
| `GET` | `/api/health` | Public | Health check |
| `GET` | `/api/docs` | Public | Swagger UI |


### Query Parameters for `GET /api/posts`

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 5 | Items per page (max 20) |
| `search` | string | — | Search term (matches title, excerpt and content; frontend uses fuzzy rank implementation) |
| `category` | string | — | Filter by category slug |

## API Docs (Swagger UI)

### The API is documented with an OpenAPI 3.0 spec:
- Spec file: server/src/docs/openapi.yaml
- Local Swagger UI: http://localhost:5001/api/docs

---

## Setup

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm or pnpm
- MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- [Clerk](https://clerk.com) app

### Clone the Repository

```bash
git clone https://github.com/Sahil-Basumatary/personal-blog.git
cd personal-blog
```

### Backend Setup

```
cd server
npm install

```

### Create server/.env:

```
MONGODB_URI=mongodb+srv://...
OWNER_USER_ID=user_xxxxxxxxxxxxx
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
PORT=5001

```

### Start the development server:

```
npm run dev
```

This starts the API on http://localhost:5001.

### Frontend Setup

```
cd client
npm install
```

### Create client/.env:

```
VITE_API_BASE_URL=http://localhost:5001/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### Start the dev server:

```
npm run dev
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Testing

Backend tests use Jest + supertest against an in-memory MongoDB instance:

```
cd server
npm test
```

### Test Coverage

- [x] Health check endpoint	
- [x] Pagination + sorting	
- [x] Search + category filtering	
- [x] Fetch by ID and slug	
- [x] View count increment	
- [x] Create post (auth + validation)	
- [x] Update post (auth + field updates)	
- [x] Delete post (auth + removal)	
- [x] Voting (auth + direction validation & per-user behavior)

## CI/CD

- GitHub Actions runs on every push to main:

- Server tests — `npm test` in `server/`
- Client build — `npm run build` in `client/`
- GitHub Actions workflow runs on every push to `main`

## License

Distributed under the MIT License. See LICENSE for details.

## Contact

GitHub: [@Sahil-Basumatary](https://github.com/Sahil-Basumatary)
LinkedIn: [Sahil Basumatary](https://www.linkedin.com/in/sahil-basumatary/)

<p align="right">(<a href="#readme-top">back to top</a>)</p> ```


