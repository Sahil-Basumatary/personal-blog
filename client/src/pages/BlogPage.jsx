import "./BlogPage.css";
import posts from "../data/posts";
import { Link, useSearchParams, useNavigate } from "react-router-dom";

function BlogPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const userPosts = JSON.parse(localStorage.getItem("user_posts") || "[]");
  const allPosts = [...userPosts, ...posts];

  const categoryFilter = searchParams.get("category");

  // Featured post from all posts
  const featuredPost = allPosts.find((post) => post.featured);

  // Apply category filter to all posts
  const filteredPosts = categoryFilter
    ? allPosts.filter((p) => p.category === categoryFilter)
    : allPosts;

  return (
    <div className="blog-page">
      {/* HEADER */}
      <section className="blog-header">
        <div className="blog-header-top">
          <div>
            <h1 className="blog-title">
              {categoryFilter
                ? `Posts in "${categoryFilter.replace("-", " ")}"`
                : "All Posts"}
            </h1>

            <p className="blog-subtitle">
              {categoryFilter
                ? "Filtered results based on your selection"
                : "A collection of thoughts, stories and reflections from my journey."}
            </p>
          </div>

          <button
            className="new-post-btn"
            onClick={() => navigate("/write")}
          >
            + New post
          </button>
        </div>
      </section>

      {/* FEATURED */}
      {!categoryFilter && featuredPost && (
        <section className="featured-post">
          <div className="featured-badge">FEATURED</div>

          <h2 className="featured-title">{featuredPost.title}</h2>

          <div className="featured-meta">
            <span className="chip">{featuredPost.categoryLabel}</span>
            <span>•</span>
            <span>
              {new Date(featuredPost.date).toLocaleDateString("en-GB")}
            </span>
          </div>

          <p className="featured-excerpt">{featuredPost.excerpt}</p>

          <button
            className="featured-button"
            onClick={() => navigate(`/blog/${featuredPost.id}`)}
          >
            what's cooking →
          </button>
        </section>
      )}

      {/* POSTS LIST */}
      <section className="posts-section">
        <h3 className="posts-section-title">
          {categoryFilter ? "Filtered posts" : "Recent posts"}
        </h3>

        <div className="posts-list">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              className="post-card"
            >
              <h4 className="post-card-title">{post.title}</h4>
              <p className="post-card-excerpt">{post.excerpt}</p>

              <div className="post-card-meta">
                <span className="chip">{post.categoryLabel}</span>
                <span>•</span>
                <span>{new Date(post.date).toLocaleDateString("en-GB")}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default BlogPage;