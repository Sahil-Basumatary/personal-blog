<a id="readme-top"></a>

<div align="center">

# personal-blog

[![Tests](https://github.com/Sahil-Basumatary/personal-blog/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Sahil-Basumatary/personal-blog/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://github.com/Sahil-Basumatary/personal-blog/blob/main/LICENSE)
[![LinkedIn](https://img.shields.io/badge/-LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/sahil-basumatary)


A full-stack personal journal where I write about computer science, life in London, and the process of learning in public.

</div>

<br />

### Tech Stack

**Backend**
* [![Node.js][Node-shield]][Node-url]
* [![Express][Express-shield]][Express-url]
* [![MongoDB][MongoDB-shield]][MongoDB-url]
* [![Jest][Jest-shield]][Jest-url]

**Frontend**
* [![React][React-shield]][React-url]
* [![Vite][Vite-shield]][Vite-url]
* [![React Router][Router-shield]][Router-url]

**Infrastructure**
* [![GitHub Actions][Actions-shield]][Actions-url]
* [![Clerk][Clerk-shield]][Clerk-url]

[Node-shield]: https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white
[Node-url]: https://nodejs.org/
[Express-shield]: https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB
[Express-url]: https://expressjs.com
[MongoDB-shield]: https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white
[MongoDB-url]: https://www.mongodb.com/

## Technical Highlights

**What I have learned throughout building this:**

- **Testing Strategy** - Implemented integration tests with mongodb-memory-server. Each test runs against an isolated in-memory database, ensuring tests don't interfere with each other. Used Supertest to test HTTP endpoints without starting the actual server.

- **Authentication Architecture** - Integrated Clerk with a custom owner-only guard. In production, Clerk middleware handles JWT validation and in tests, a mock middleware injects test user IDs for deterministic testing.

- **Performance Optimization** - Implemented server side pagination with limit capping (max 50 items) to prevent abuse. Used `Promise.all()` to parallelize post fetching and count queries, cutting response time in half.

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

## Project Structure

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
│   └── package.json
│
├── blog/                      # Static Jekyll content 
└── .github/workflows/         # CI pipeline

## Features

# Owner-Only Writing Experience
- Authenticated via Clerk with dedicated OWNER_USER_ID guard
- Create, edit, and delete posts from a clean writing UI
- Local draft autosave 
- SEO-friendly slug generation with collision handling

# Search and Discovery
- Full-text search across title, excerpt, and content
- Lightweight fuzzy search with typo tolerance (1-char mismatch)
- Category filters 
- Paginated results with configurable page size (1–50)

# Blog Reading Experience
- Featured post highlight on the main blog page
- Reading progress bar on individual posts
- View counter (backend source of truth with local fallback)
- Mobile-responsive design with hamburger navigation

# Engagement
- Per-post upvote/downvote system
- Vote state persisted in local storage and synced to backend
- Login-gated voting to prevent spam

# Security & Reliability
- Rate limiting: 20 writes/min, 60 votes/min per IP
- Input validation and sanitization on all endpoints
- Proper HTTP status codes (400, 401, 403, 404, 500)
- Error handling throughout the stack

