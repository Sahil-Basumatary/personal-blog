import "./BlogPage.css";
import posts from "../data/posts";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function BlogPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const userPosts = JSON.parse(localStorage.getItem("user_posts") || "[]");
  const allPosts = [...userPosts, ...posts];

  const categoryFilter = searchParams.get("category");

  const featuredPost = allPosts.find((post) => post.featured);

  const filteredPosts = categoryFilter
    ? allPosts.filter((p) => p.category === categoryFilter)
    : allPosts;

  // Voting state 
  const [votes, setVotes] = useState({});

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("post_votes") || "{}");
    setVotes(stored);
  }, []);

  function updateVotes(newVotes) {
    setVotes(newVotes);
    localStorage.setItem("post_votes", JSON.stringify(newVotes));
  }

  function handleUpvote(id) {
    setVotes((prev) => {
      const current = prev[id] || { score: 0, userVote: null };
      let { score, userVote } = current;

      if (userVote === "up") {
        // remove upvote
        score -= 1;
        userVote = null;
      } else if (userVote === "down") {
        // switch from down to up
        score += 2;
        userVote = "up";
      } else {
        // no vote to upvote
        score += 1;
        userVote = "up";
      }

      const next = { ...prev, [id]: { score, userVote } };
      localStorage.setItem("post_votes", JSON.stringify(next));
      return next;
    });
  }

  function handleDownvote(id) {
    setVotes((prev) => {
      const current = prev[id] || { score: 0, userVote: null };
      let { score, userVote } = current;

      if (userVote === "down") {
        // remove downvote
        score += 1;
        userVote = null;
      } else if (userVote === "up") {
        // switch from up to down
        score -= 2;
        userVote = "down";
      } else {
        // no vote to downvote
        score -= 1;
        userVote = "down";
      }

      const next = { ...prev, [id]: { score, userVote } };
      localStorage.setItem("post_votes", JSON.stringify(next));
      return next;
    });
  }

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
          {filteredPosts.map((post) => {
            const voteInfo = votes[post.id] || { score: 0, userVote: null };

            const finalExcerpt =
              post.excerpt && post.excerpt.trim().length > 0
                ? post.excerpt
                : post.content.substring(0, 120) + "...";

            const allViews = JSON.parse(localStorage.getItem("post_views") || "{}");
            const views = allViews[post.id] || 0;

            return (
              <div key={post.id} className="post-card-wrapper">

                <div className="post-card-views">
                  <span className="view-pill"> {views} views</span>
                </div>

                {/* Post Card */}
                <Link to={`/blog/${post.id}`} className="post-card">
                  <h4 className="post-card-title">{post.title}</h4>
                  <p className="post-card-excerpt">{finalExcerpt}</p>

                  <div className="post-card-meta">
                    <span className="chip">{post.categoryLabel}</span>
                    <span>•</span>
                    <span>{new Date(post.date).toLocaleDateString("en-GB")}</span>
                  </div>
                </Link>

                {/* Vote Bar BELOW */}
                <div className="vote-bar-below">
                  <button
                    className={`vote-btn up ${voteInfo.userVote === "up" ? "active" : ""}`}
                    onClick={() => handleUpvote(post.id)}
                  >
                    ↑
                  </button>

                  <span className="vote-count">
                    {voteInfo.score === 0 ? "0" : voteInfo.score}
                  </span>

                  <button
                    className={`vote-btn down ${voteInfo.userVote === "down" ? "active" : ""}`}
                    onClick={() => handleDownvote(post.id)}
                  >
                    ↓
                  </button>
                </div>

              </div>

            );
          })}
        </div>
      </section>
    </div>
  );
}

export default BlogPage;