import "./BlogPage.css";
import posts from "../data/posts";
import { Link, useNavigate } from "react-router-dom";

function BlogPage() {
  const featuredPost = posts.find((post) => post.featured);
  const otherPosts = posts.filter((post) => !post.featured);
  const navigate = useNavigate();

  return (
    <div className="blog-page">
      <section className="blog-header">
        <h1>All Posts</h1>
        <p>
          A collection of thoughts, stories and notes from my journey as a CS
          student in London.
        </p>
      </section>

      {featuredPost && (
        <section className="featured-post">
          <div className="featured-badge">Featured</div>
          <h2>{featuredPost.title}</h2>

          <div className="featured-meta">
            <span>{featuredPost.categoryLabel}</span>
            <span>·</span>
            <span>{new Date(featuredPost.date).toLocaleDateString()}</span>
          </div>

          <p className="featured-excerpt">{featuredPost.excerpt}</p>

          <button
            className="featured-button"
            onClick={() => navigate(`/blog/${featuredPost.id}`)}
          >
            what's cooking
          </button>
        </section>
      )}

      <section className="posts-list">
        <h3>Recent posts</h3>

        <div className="posts-list-inner">
          {otherPosts.map((post) => (
            <Link
              to={`/blog/${post.id}`}
              className="post-item-link"
              key={post.id}
            >
              <article className="post-item">
                <div className="post-main">
                  <h4>{post.title}</h4>
                  <p className="post-excerpt">{post.excerpt}</p>
                </div>

                <div className="post-meta">
                  <span className="post-category">{post.categoryLabel}</span>
                  <span className="dot">•</span>
                  <span className="post-date">
                    {new Date(post.date).toLocaleDateString()}
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default BlogPage;