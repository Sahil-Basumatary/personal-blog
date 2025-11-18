import "./BlogPage.css";
import posts from "../data/posts";

function BlogPage() {
  const featuredPost = posts.find((post) => post.featured);
  const otherPosts = posts.filter((post) => !post.featured);

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

          <button className="featured-button">whats cooking</button>
        </section>
      )}

      <section className="posts-list">
        <h3>Recent posts</h3>

        <div className="posts-list-inner">
          {otherPosts.map((post) => (
            <article key={post.id} className="post-item">
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
          ))}
        </div>
      </section>
    </div>
  );
}

export default BlogPage;