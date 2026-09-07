# Personal Blog

[blog.sahilbzy.com](https://blog.sahilbzy.com) is my personal blog for writing about computer science, life in London, useful tools, and learning in public.

## What it includes

- Paginated posts with featured stories, markdown rendering, syntax highlighting, reading time, and reading progress
- Owner-only writing with Clerk, a TipTap editor, slug URLs, and local draft autosave
- Search and category browsing on the blog page
- Signed-in upvotes and downvotes with one vote per user
- Double opt-in email subscriptions, unsubscribe, data deletion, and new-post notifications
- RSS, sitemap, metadata, structured data, Open Graph images, and bot prerendering
- Owner-only image uploads through S3 and CloudFront

Only the configured owner can create, edit, or delete posts.

## How it works

The web app uses React 19, Vite 7, React Router 7, and Clerk. The API uses Node.js 20, Express 4, Mongoose 9, and MongoDB.

Resend sends newsletter emails. S3 stores uploaded images, and CloudFront serves them. Jest, Supertest, and an in-memory MongoDB instance test the API. Vitest and Testing Library cover the client.

The API validates and sanitises post content, checks uploaded file signatures, restricts CORS, and rate-limits writes, votes, subscriptions, and uploads.

```text
React SPA -> Express API -> MongoDB
                      |-> Resend
                      |-> S3 and CloudFront
                      |-> RSS, sitemap, and Open Graph routes
```

## Run locally

Requirements

- Node.js 20
- npm
- MongoDB
- A Clerk application

```bash
git clone https://github.com/Sahil-Basumatary/personal-blog.git
cd personal-blog

npm --prefix server ci
npm --prefix client ci
```

Create `server/.env`.

```env
MONGODB_URI=mongodb://localhost:27017/personal-blog
OWNER_USER_ID=user_...
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLIENT_ORIGIN=http://localhost:5173
PORT=5001
```

Create `client/.env`.

```env
VITE_API_BASE_URL=http://localhost:5001/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_OWNER_USER_ID=user_...
VITE_SITE_URL=http://localhost:5173
```

Start the API and client in separate terminals.

```bash
npm --prefix server run dev
```

```bash
npm --prefix client run dev
```

Open [http://localhost:5173](http://localhost:5173). No seed step is required because MongoDB collections are created on first use. Swagger UI is available at [http://localhost:5001/api/docs](http://localhost:5001/api/docs) outside production.

Set `RESEND_API_KEY` to send real emails and `EMAIL_FROM` to choose the sender. Without the API key, development emails are written to the console. Image uploads require `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, and `CLOUDFRONT_DOMAIN`.

Optional deployment settings include `CLIENT_ORIGIN_PREVIEW`, `BLOG_NAME`, `VITE_GA4_MEASUREMENT_ID`, `VITE_GOOGLE_SITE_VERIFICATION`, and `PRERENDER_TOKEN`.

## Checks

```bash
npm --prefix server test
npm --prefix server run lint
npm --prefix client test -- --run
npm --prefix client run lint
npm --prefix client run build
```

GitHub Actions runs the server tests and client build on pushes and pull requests to `main`.

## Known issues

- Search and category filters only cover posts loaded for the current page
- View counts are not deduplicated by visitor or session
- Newsletter links use `/posts/{slug}`, while the client reads posts from `/blog/{id}`
- Post, RSS, and Open Graph caches are local to each API process
- Client tests are not currently part of CI

## Contact

- [GitHub](https://github.com/Sahil-Basumatary)
- [LinkedIn](https://www.linkedin.com/in/sahil-basumatary/)

## License

This project is source-available under the [PolyForm Noncommercial License 1.0.0](LICENSE). Commercial use requires separate permission.
