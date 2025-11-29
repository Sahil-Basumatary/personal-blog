import "./BlogPage.css";
import posts from "../data/posts";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// search feat helpers
function tokenize(text) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter(Boolean);
}

function prefixScore(tokens, q, weight) {
  let score = 0;
  for (const token of tokens) {
    if (token.startsWith(q)) {
      score += weight;
    }
  }
  return score;
}

// for near matches in search
function fuzzyPrefixScore(tokens, q, weight) {
  if (q.length < 3) return 0;

  let score = 0;

  for (const token of tokens) {

    if (Math.abs(token.length - q.length) > 2) continue;

    const len = Math.min(token.length, q.length);
    let mismatches = 0;

    for (let i = 0; i < len; i++) {
      if (token[i] !== q[i]) {
        mismatches++;
        if (mismatches > 1) break; //allowing only 1 typo
      }
    }

    if (mismatches > 0 && mismatches <= 1) {
      score += weight;
    }
  }

  return score;
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function BlogPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState(
    JSON.parse(localStorage.getItem("recent_searches") || "[]")
  );

  const [queryInput, setQueryInput] = useState("");  // immediate typing

  function saveRecent(term) {
    if (!term.trim()) return;

    let updated = [term, ...recentSearches.filter((t) => t !== term)];
    updated = updated.slice(0, 5); // max 5

    setRecentSearches(updated);
    localStorage.setItem("recent_searches", JSON.stringify(updated));
  }

  function removeRecent(term) {
    const updated = recentSearches.filter((t) => t !== term);
    setRecentSearches(updated);
    localStorage.setItem("recent_searches", JSON.stringify(updated));
  }

  const userPosts = JSON.parse(localStorage.getItem("user_posts") || "[]");
  const allPosts = [...userPosts, ...posts];

  const categoryFilter = searchParams.get("category");

  const featuredPost = allPosts.find((post) => post.featured);

  const basePosts = categoryFilter
    ? allPosts.filter((p) => p.category === categoryFilter)
    : allPosts;

  let filteredPosts = basePosts;

  if (query.trim()) {
    const q = query.trim().toLowerCase();
    const results = [];

    for (const post of basePosts) {
      const titleTokens = tokenize(post.title || "");
      const excerptTokens = tokenize(post.excerpt || "");
      const categoryTokens = tokenize(post.categoryLabel || "");
      const contentTokens = tokenize(post.content || "");

      let score = 0;
      score += prefixScore(titleTokens, q, 6);
      score += prefixScore(excerptTokens, q, 4);
      score += prefixScore(categoryTokens, q, 4);
      score += prefixScore(contentTokens, q, 2);

      if (post.title.toLowerCase().startsWith(q)) score += 50;

      if (score === 0) {
        score += fuzzyPrefixScore(titleTokens, q, 3);
      }

      if (score > 0) {
        results.push({ post, score });
      }
    }

    results.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.post.date) - new Date(a.post.date);
    });

    filteredPosts = results.map((r) => r.post);
  }

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

  const debouncedSearch = debounce((value) => {
    setQuery(value);
  }, 200);

  const showLiveDropdown = query.trim().length > 0;

  const liveResults = [];

  if (showLiveDropdown) {
    const q = query.trim().toLowerCase();

    for (const post of basePosts) {
      const titleTokens = tokenize(post.title || "");
      const excerptTokens = tokenize(post.excerpt || "");
      const categoryTokens = tokenize(post.categoryLabel || "");
      const contentTokens = tokenize(post.content || "");

      let score = 0;
      score += prefixScore(titleTokens, q, 6);
      score += prefixScore(excerptTokens, q, 4);
      score += prefixScore(categoryTokens, q, 3);
      score += prefixScore(contentTokens, q, 2);

      if (post.title.toLowerCase().startsWith(q)) score += 50;

      if (score === 0) {
        score += fuzzyPrefixScore(titleTokens, q, 3);
      }

      if (score > 0) {
        liveResults.push({ post, score });
      }
    }

    liveResults.sort((a, b) => b.score - a.score);

    // Only show top 5 in dropdown
    liveResults.splice(5);
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

            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search posts…"
                value={queryInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setQueryInput(value);
                  debouncedSearch(value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    saveRecent(queryInput);
                  }
                }}
              />

              {showLiveDropdown && liveResults.length > 0 && (
                <div className="live-dropdown">
                  {liveResults.map(({ post }) => (
                    <div
                      key={post.id}
                      className="live-result-item"
                      onClick={() => navigate(`/blog/${post.id}`)}
                    >
                      <div className="live-result-title">{post.title}</div>
                      <div className="live-result-sub">
                        {post.categoryLabel} · {new Date(post.date).toLocaleDateString("en-GB")}
                      </div>
                    </div>
                  ))}

                  <div
                    className="live-view-all"
                    onClick={() => {
                      saveRecent(query);
                      setQueryInput(query);
                    }}
                  >
                    View all results →
                  </div>
                </div>
              )}


              {query.length === 0 && recentSearches.length > 0 && (
                <div className="recent-dropdown">
                  <div className="recent-title">Recent searches</div>

                  {recentSearches.map((item) => (
                    <div className="recent-item" key={item}>
                      <span
                        className="recent-text"
                        onClick={() => {
                          setQueryInput(item);
                          setQuery(item);
                        }}
                      >
                        {item}
                      </span>

                      <button
                        className="delete-recent"
                        onClick={() => removeRecent(item)}
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
      {!categoryFilter && !query.trim() && featuredPost && (
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
          {query
            ? `Search results for “${query}”`
            : categoryFilter
              ? "Filtered posts"
              : "Recent posts"}
        </h3>

        <div className="posts-list">
          {query && filteredPosts.length === 0 && (
            <div className="empty-search">
              <p className="empty-text">
                No posts found matching “{query}”.
              </p>
            </div>
          )}

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