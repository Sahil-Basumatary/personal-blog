import { useParams, useNavigate } from "react-router-dom";
import ReadingProgressBar from "../components/ReadingProgressBar";
import "./SingleBlogPage.css";
import { useEffect, useState, useRef } from "react";
import { fetchPostById, incrementPostViews, voteOnPost, deletePost } from "../api/posts";
import { useUser, useAuth } from "@clerk/clerk-react";
import { OWNER_USER_ID } from "../config/authOwner";

function mapPostFromApi(p) {
  const slugOrId = p.slug || p._id;

  return {
    id: slugOrId,
    slug: slugOrId,
    title: p.title,
    content: p.content || "",
    category: p.category || "general",
    categoryLabel: p.categoryLabel || (p.category ? p.category : "General"),
    date: p.date || p.createdAt || new Date().toISOString(),
    featured: p.isFeatured,
    excerpt: p.excerpt || "",
    isUserPost: false,
    views: typeof p.views === "number" ? p.views : 0,
  };
}

function useClickOutside(handler) {
  const ref = useRef();
  useEffect(() => {
    function listener(e) {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler();
    }
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, []);
  return ref;
}

function SingleBlogPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const isOwner = isLoaded && isSignedIn && user?.id === OWNER_USER_ID;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [votes, setVotes] = useState({ score: 0, userVote: null });
  const [backendViews, setBackendViews] = useState(null);
  const isUserPost = isOwner;

      useEffect(() => {
      let active = true;

      async function loadPost() {
        try {
          const apiPost = await fetchPostById(id);
          if (!active) return;

          if (typeof apiPost.views === "number") {
            setBackendViews(apiPost.views);
          }

          const mapped = mapPostFromApi(apiPost);
          setPost(mapped);
        } catch (err) {
          console.error("Failed to fetch post from backend", err);
          if (!active) return;
          setError("Post not found");
        } finally {
          if (active) setLoading(false);
        }
      }

      loadPost();
      return () => {
        active = false;
      };
    }, [id]);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useClickOutside(() => setMenuOpen(false));

  function incrementViewsLocal(postId) {
    const stored = JSON.parse(localStorage.getItem("post_views") || "{}");
    stored[postId] = (stored[postId] || 0) + 1;
    localStorage.setItem("post_views", JSON.stringify(stored));
    return stored[postId];
  }

  const hasIncremented = useRef(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("post_votes") || "{}");
    if (stored[id]) setVotes(stored[id]);
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    async function bumpViews() {
      if (hasIncremented.current) return;
      hasIncremented.current = true;

      try {
        const updated = await incrementPostViews(id);

        if (!cancelled && updated && typeof updated.views === "number") {
          setBackendViews(updated.views);
        }
      } catch (err) {
        console.error("Failed to increment views on backend, using local only", err);
        const localCount = incrementViewsLocal(id);
        if (!cancelled) {
          setBackendViews((prev) => (prev == null ? localCount : prev));
        }
      }
    }

    bumpViews();

    return () => {
      cancelled = true;
    };
  }, [id]);

  function syncVotes(next) {
    setVotes(next);
    const all = JSON.parse(localStorage.getItem("post_votes") || "{}");
    all[id] = next;
    localStorage.setItem("post_votes", JSON.stringify(all));
  }

  async function handleUpvote() {
    if (!isSignedIn) {
      navigate("/sign-in");
      return;
    }

    const next = ((prev) => {
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
    })(votes);

    syncVotes(next);

    try {
      const token = await getToken();
      await voteOnPost(id, "up", token);
    } catch (err) {
      console.error("Failed to sync upvote to backend", err);
    }
  }

  async function handleDownvote() {
    if (!isSignedIn) {
      navigate("/sign-in");
      return;
    }

    const next = ((prev) => {
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
    })(votes);

    syncVotes(next);

    try {
      const token = await getToken();
      await voteOnPost(id, "down", token);
    } catch (err) {
      console.error("Failed to sync downvote to backend", err);
    }
  }

  const localViews =
    JSON.parse(localStorage.getItem("post_views") || "{}")[id] || 0;
  const views = backendViews != null ? backendViews : localViews;

    async function handleDelete() {
      const ok = window.confirm("Are you sure you want to delete this post?");
      if (!ok) return;

      try {
        const token = await getToken();
        await deletePost(id, token);

        const votes = JSON.parse(localStorage.getItem("post_votes") || "{}");
        delete votes[id];
        localStorage.setItem("post_votes", JSON.stringify(votes));

        navigate("/blog");
      } catch (err) {
        console.error("Failed to delete post", err);
        alert("Failed to delete post. Please try again.");
      }
    }

  if (loading) {
  return <div className="single-container">Loading post...</div>;
  }

  if (!post || error) {
    return <div className="not-found">Post not found.</div>;
  }

  return (
    <div className="single-container">
      <ReadingProgressBar />

      {/* HEADER */}
      <div className="single-header">
        <div className="single-header-top">
          <a href="/blog" className="back-link">← Back to all posts</a>

          <a href="/" className="home-pill">
            <img
              src="/icons/home.svg"
              alt="Home"
              className="home-icon"
            />
            Home
          </a>
        </div>

        <h1 className="single-title">{post.title}</h1>

        <div className="single-meta-row">
          <div className="single-meta-left">
            <span className="chip">{post.categoryLabel}</span>
            <span>•</span>
            <span>{new Date(post.date).toLocaleDateString("en-GB")}</span>
            <span className="view-pill">{views} views</span>
          </div>

          {isUserPost && (
            <div className="three-dots-wrapper">
              <button
                className="three-dots-btn"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Post actions"
              >
                <svg
                  viewBox="0 -181 512 512"
                  width="22"
                  height="22"
                  fill="#444"
                  style={{ display: "block" }}
                >
                  <path d="m437 0c-41.355469 0-75 33.644531-75 75s33.644531 75 75 75 75-33.644531 75-75-33.644531-75-75-75zm0 120c-24.8125 0-45-20.1875-45-45s20.1875-45 45-45 45 20.1875 45 45-20.1875 45-45 45zm0 0"></path>
                  <path d="m256 0c-41.355469 0-75 33.644531-75 75s33.644531 75 75 75 75-33.644531 75-75-33.644531-75-75-75zm0 120c-24.8125 0-45-20.1875-45-45s20.1875-45 45-45 45 20.1875 45 45-20.1875 45-45 45zm0 0"></path>
                  <path d="m75 0c-41.355469 0-75 33.644531-75 75s33.644531 75 75 75 75-33.644531 75-75-33.644531-75-75-75zm0 120c-24.8125 0-45-20.1875-45-45s20.1875-45 45-45 45 20.1875 45 45-20.1875 45-45 45zm0 0"></path>
                </svg>
              </button>

              {menuOpen && (
                <div className="action-menu" ref={menuRef}>
                  <div className="action-item" onClick={() => navigate(`/edit/${post.id}`)}>
                    <svg width="18" height="18" viewBox="0 0 100 100" fill="#222">
                      <path d="m18 84.2c1 0 1.2-.1 2.1-.3l18-3.6c1.9-.5 3.8-1.4 5.3-2.9l43.6-43.6c6.7-6.7 6.7-18.2 0-24.9l-3.7-3.9c-6.7-6.7-18.3-6.7-25 0l-43.6 43.7c-1.4 1.4-2.4 3.4-2.9 5.3l-3.8 18.2c-.5 3.4.5 6.7 2.9 9.1 1.9 1.9 4.7 2.9 7.1 2.9zm3.4-28.3 43.6-43.7c2.9-2.9 8.2-2.9 11 0l3.8 3.8c3.4 3.4 3.4 8.2 0 11.5l-43.5 43.7-18.5 3.1z"></path>
                      <path d="m86.6 90.4h-73.8c-2.9 0-4.8 1.9-4.8 4.8s2.4 4.8 4.8 4.8h73.4c2.9 0 5.3-1.9 5.3-4.8-.1-2.9-2.5-4.8-4.9-4.8z"></path>
                    </svg>
                    Edit post
                  </div>

                  <div className="divider"></div>

                  <div className="action-item delete" onClick={handleDelete}>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipRule="evenodd" fill="currentColor" fillRule="evenodd">
                        <path d="m5.11686 7.75166c.4133-.02755.77068.28515.79823.69845l.45994 6.89909c.08986 1.3479.15389 2.2857.29445 2.9913.13635.6845.32669 1.0468.6001 1.3026.27341.2557.64757.4216 1.33957.5121.7134.0933 1.65345.0948 3.00425.0948h.7734c1.3508 0 2.2908-.0015 3.0042-.0948.692-.0905 1.0662-.2564 1.3396-.5121.2734-.2558.4637-.6181.6001-1.3026.1406-.7056.2046-1.6434.2944-2.9913l.46-6.89909c.0275-.4133.3849-.726.7982-.69845s.726.38493.6985.79823l-.4635 6.95171c-.0855 1.2828-.1545 2.3189-.3165 3.132-.1684.8453-.4548 1.5514-1.0464 2.1048-.5916.5535-1.3152.7923-2.1698.9041-.8221.1075-1.8605.1075-3.1461.1075h-.8788c-1.2856 0-2.32406 0-3.1461-.1075-.85465-.1118-1.5782-.3506-2.1698-.9041-.59159-.5534-.87801-1.2595-1.04641-2.1048-.16197-.8131-.23103-1.8492-.31653-3.132l-.46345-6.95171c-.02755-.4133.28516-.77068.69845-.79823z"></path>
                        <path d="m10.3553 2.25-.0459-.00002c-.2164-.00014-.40495-.00026-.58297.02817-.7033.11231-1.3119.55096-1.64084 1.18265-.08327.1599-.14277.3388-.21107.54413l-.01452.04361-.09709.29126c-.01899.05697-.02428.07268-.02889.0854-.17511.48412-.62914.81136-1.14379.8244-.01353.00034-.0301.0004-.09015.0004h-3.00008c-.41421 0-.75.33579-.75.75s.33579.75.75.75h3.00865.01674 10.94941.0167 3.0086c.4142 0 .75-.33579.75-.75s-.3358-.75-.75-.75h-3c-.0601 0-.0766-.00006-.0902-.0004-.5146-.01304-.9686-.3403-1.1438-.82442-.0045-.01264-.0099-.02869-.0288-.08538l-.0971-.29126-.0146-.04364c-.0683-.20533-.1278-.38421-.211-.5441-.329-.63169-.9376-1.07034-1.6409-1.18265-.178-.02843-.3665-.02831-.5829-.02817l-.046.00002zm-1.21072 2.68544c-.03927.10856-.08492.21354-.13643.31456h5.98385c-.0515-.10102-.0971-.20598-.1364-.31454l-.0387-.11334-.0998-.29923c-.0911-.27352-.1121-.3293-.1329-.36929-.1097-.21056-.3126-.35678-.547-.39422-.0445-.00711-.1041-.00938-.3924-.00938h-3.2895c-.2883 0-.3478.00227-.39234.00938-.23443.03744-.4373.18366-.54695.39422-.02082.03999-.04182.09578-.13299.36929l-.0998.29941c-.01502.04508-.02672.08018-.03864.11314z"></path>
                      </g>
                    </svg>
                    Delete
                  </div>
                </div>
              )}
            </div>
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
          <img
            src="/icons/thumb-up.svg"
            alt="Upvote"
            className="vote-icon"
          />
        </button>

        <span className="vote-count">
          {votes.score === 0 ? "0" : votes.score}
        </span>

        <button
          className={`vote-btn down ${votes.userVote === "down" ? "active" : ""}`}
          onClick={handleDownvote}
        >
          <img
            src="/icons/thumb-down.svg"
            alt="Downvote"
            className="vote-icon"
          />
        </button>
      </div>
    </div>
  );
}

export default SingleBlogPage;