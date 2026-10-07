# Personal Blog

[blog.sahilbzy.com](https://blog.sahilbzy.com) is my personal blog for writing about computer science, life in London, useful tools, and learning in public :)

## What it includes

- Paginated posts with featured stories, markdown rendering, syntax highlighting, reading time, and reading progress
- Owner-only writing with Clerk, a TipTap editor, slug URLs, and local draft autosave
- Search and category browsing on the blog page
- Signed-in upvotes and downvotes with one vote per user
- Double opt-in email subscriptions, unsubscribe, data deletion, and new-post notifications
- RSS, sitemap, metadata, structured data, Open Graph images, and bot prerendering
- Owner-only image uploads through S3 and CloudFront

## How it works

The web app uses React 19, Vite 7, React Router 7, and Clerk. The API uses Node.js 20, Express 4, Mongoose 9, and MongoDB.

The API validates and sanitises post content, checks uploaded file signatures, restricts CORS, and rate-limits writes, votes, subscriptions, and uploads.

```text
React SPA -> Express API -> MongoDB
                      |-> Resend
                      |-> S3 and CloudFront
                      |-> RSS, sitemap, and Open Graph routes
```

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
