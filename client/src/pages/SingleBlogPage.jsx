import { useParams, useNavigate } from "react-router-dom";
import posts from "../data/posts";
import ReadingProgressBar from "../components/ReadingProgressBar";
import "./SingleBlogPage.css";
import { useEffect, useState } from "react";

function SingleBlogPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [votes, setVotes] = useState({ score: 0, userVote: null });

  const userPosts = JSON.parse(localStorage.getItem("user_posts") || "[]");
  const allPosts = [...userPosts, ...posts];

  const post = allPosts.find((p) => String(p.id) === String(id));
  const isUserPost =
    post?.isUserPost || userPosts.some((p) => String(p.id) === String(id));

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("post_votes") || "{}");
    if (stored[id]) setVotes(stored[id]);
  }, [id]);

  function syncVotes(next) {
    setVotes(next);
    const all = JSON.parse(localStorage.getItem("post_votes") || "{}");
    all[id] = next;
    localStorage.setItem("post_votes", JSON.stringify(all));
  }

  function handleUpvote() {
    syncVotes(
      ((prev) => {
        const current = prev || { score: 0, userVote: null };
        let { score, userVote } = current;

        if (userVote === "up") {
          score -= 1;
          userVote = null;
        } else if (userVote === "down") {
          score += 2;
          userVote = "up";
        } else {
          score += 1;
          userVote = "up";
        }

        return { score, userVote };
      })(votes)
    );
  }

  function handleDownvote() {
    syncVotes(
      ((prev) => {
        const current = prev || { score: 0, userVote: null };
        let { score, userVote } = current;

        if (userVote === "down") {
          score += 1;
          userVote = null;
        } else if (userVote === "up") {
          score -= 2;
          userVote = "down";
        } else {
          score -= 1;
          userVote = "down";
        }

        return { score, userVote };
      })(votes)
    );
  }

  if (!post) return <div className="not-found">Post not found.</div>;

  return (
    <div className="single-container">
      <ReadingProgressBar />

      {/* HEADER */}
      <div className="single-header">
        <a href="/blog" className="back-link">← Back to all posts</a>

        <h1 className="single-title">{post.title}</h1>

        <div className="single-meta-row">
          <div className="single-meta">
            <span className="chip">{post.categoryLabel}</span>
            <span>•</span>
            <span>{new Date(post.date).toLocaleDateString("en-GB")}</span>
          </div>

          {isUserPost && (
            <button
              type="button"
              className="edit-post-btn"
              onClick={() => navigate(`/edit/${post.id}`)}
            >
              Edit post
            </button>
          )}
        </div>
      </div>

      {/* FULL CONTENT */}
      <article className="single-content">
        {post.content.split("\n").map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </article>

      {/* VOTE BELOW */}
      <div className="single-footer-votes">
        <button
          className={`vote-btn up ${votes.userVote === "up" ? "active" : ""}`}
          onClick={handleUpvote}
        >
          ↑
        </button>

        <span className="vote-count">
          {votes.score === 0 ? "0" : votes.score}
        </span>

        <button
          className={`vote-btn down ${votes.userVote === "down" ? "active" : ""}`}
          onClick={handleDownvote}
        >
          ↓
        </button>
      </div>
    </div>
  );
}

export default SingleBlogPage;