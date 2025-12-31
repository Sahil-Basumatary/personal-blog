import "./BlogPage.css";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { fetchPosts, voteOnPost, deletePost} from "../api/posts";
import { useUser, useAuth } from "@clerk/clerk-react";
import { OWNER_USER_ID } from "../config/authOwner";
import UserChip from "../components/UserChip";
import { useMemo } from "react";

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

function BlogPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth(); 
  const isOwner = isLoaded && isSignedIn && user?.id === OWNER_USER_ID;

  const PAGE_SIZE = 5;

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const makePostPath = (post) =>
  post.slug ? `/blog/${post.slug}` : `/blog/${post.id}`;

  const menuRef = useRef(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState(
    JSON.parse(localStorage.getItem("recent_searches") || "[]")
  );

  const [queryInput, setQueryInput] = useState("");  

  const [backendPosts, setBackendPosts] = useState([]);
  const [postsError, setPostsError] = useState(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenFor(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

    useEffect(() => {
      let active = true;

      async function loadPosts() {
        try {
          const apiResult = await fetchPosts({ page, limit: PAGE_SIZE });
          if (!active) return;

          const mapped = (apiResult.items || []).map(mapPostFromApi);
          setBackendPosts(mapped);
          setPostsError(null);

          if (typeof apiResult.totalPages === "number") {
            setTotalPages(apiResult.totalPages || 1);
          } else {
            setTotalPages(1);
          }
        } catch (err) {
          console.error("Failed to fetch posts from backend", err);
          if (active) setPostsError("Failed to load posts from server");
          setBackendPosts([]); 
        }
      }

      loadPosts();
      return () => {
        active = false;
      };
    }, [page]);

  function saveRecent(term) {
    if (!term.trim()) return;

    let updated = [term, ...recentSearches.filter((t) => t !== term)];
    updated = updated.slice(0, 5); 

    setRecentSearches(updated);
    localStorage.setItem("recent_searches", JSON.stringify(updated));
  }

  function removeRecent(term) {
    const updated = recentSearches.filter((t) => t !== term);
    setRecentSearches(updated);
    localStorage.setItem("recent_searches", JSON.stringify(updated));
  }

  const categoryFilter = searchParams.get("category");

  const allPosts = backendPosts;
  const basePostsForSearch = categoryFilter
  ? allPosts.filter((p) => p.category === categoryFilter)
  : allPosts;

  const featuredPost =
    !categoryFilter && !query.trim()
      ? allPosts.find((post) => post.featured)
      : null;

  const filteredPosts = useMemo(() => {
    if (!query.trim()) {
      return basePostsForSearch;
    }

    const q = query.trim().toLowerCase();
    const results = [];

    for (const post of basePostsForSearch) {
      const titleTokens = tokenize(post.title || "");
      const excerptTokens = tokenize(post.excerpt || "");
      const categoryTokens = tokenize(post.categoryLabel || "");
      const contentTokens = tokenize(post.content || "");

      let score = 0;
      score += prefixScore(titleTokens, q, 6);
      score += prefixScore(excerptTokens, q, 4);
      score += prefixScore(categoryTokens, q, 4);
      score += prefixScore(contentTokens, q, 2);

      if ((post.title || "").toLowerCase().startsWith(q)) score += 50;

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

    return results.map((r) => r.post);
  }, [basePostsForSearch, query]);

  // Voting state 
  const [votes, setVotes] = useState({});

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("post_votes") || "{}");
    setVotes(stored);
  }, []);

  async function handleUpvote(id) {
    if (!isSignedIn) {
      navigate("/sign-in");
      return;
    }

    setVotes((prev) => {
      const current = prev[id] || { score: 0, userVote: null };
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

      const next = { ...prev, [id]: { score, userVote } };
      localStorage.setItem("post_votes", JSON.stringify(next));
      return next;
    });

    try {
      const token = await getToken();
      await voteOnPost(id, "up", token);
    } catch (err) {
      console.error("Failed to sync upvote to backend", err);
    }
  }

  async function handleDownvote(id) {
    if (!isSignedIn) {
      navigate("/sign-in");
      return;
    }

    setVotes((prev) => {
      const current = prev[id] || { score: 0, userVote: null };
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

      const next = { ...prev, [id]: { score, userVote } };
      localStorage.setItem("post_votes", JSON.stringify(next));
      return next;
    });

    try {
      const token = await getToken();
      await voteOnPost(id, "down", token);
    } catch (err) {
      console.error("Failed to sync downvote to backend", err);
    }
  }

  const debouncedSearch = debounce((value) => {
    setQuery(value);
  }, 200);

  const showLiveDropdown = query.trim().length > 0;

  const liveResults = [];

  if (showLiveDropdown) {
    const q = query.trim().toLowerCase();

    for (const post of basePostsForSearch) {
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

  const [menuOpenFor, setMenuOpenFor] = useState(null);

  async function handleDeleteFromList(deleteId) {
    const ok = window.confirm("Are you sure you want to delete this post?");
    if (!ok) return;

    try {
      const token = await getToken();
      await deletePost(deleteId, token);

      setBackendPosts((prev) =>
        prev.filter((p) => String(p.id) !== String(deleteId))
      );

      const votes = JSON.parse(localStorage.getItem("post_votes") || "{}");
      delete votes[deleteId];
      localStorage.setItem("post_votes", JSON.stringify(votes));
    } catch (err) {
      console.error("Failed to delete post on backend", err);
      alert("Failed to delete post. Please try again.");
    }
  }

  return (
    <div className="blog-page page-shell">
      {/* HEADER */}
      <section className="blog-header">
        <UserChip surface="light" />
        <div className="blog-header-top">
          <div>
            <Link to="/" className="home-pill">
              <img src="/icons/home.svg" alt="Home" className="home-icon" /> Home
            </Link>
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
                placeholder="Search posts bruv"
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
                      onClick={() => navigate(makePostPath(post))}
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
          
          <div className="blog-header-right">
            {isOwner && (
              <button
                className="new-post-btn"
                onClick={() => navigate("/write")}
              >
                + New post
              </button>
            )}
          </div>
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
            onClick={() => navigate(makePostPath(featuredPost))}
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

        {postsError && (
          <div className="error-banner">
            {postsError} - please check your connection or try again.
          </div>
        )}

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
            const localViews = allViews[post.id] || 0;

            const views = Math.max(
              typeof post.views === "number" ? post.views : 0,
              localViews
            );

            return (
              <div key={post.id} className="post-card-wrapper">

                {/* --- Views Pill --- */}
                <div className="post-card-views">
                  <span className="view-pill">{views} views</span>

                  {isOwner && (
                    <div className="three-dots-wrapper">
                      <button
                        className="three-dots-btn"
                        onClick={() =>
                          setMenuOpenFor((current) => (current === post.id ? null : post.id))
                        }
                        aria-label="Post actions"
                      >
                        <img
                          src="/icons/three-dot.svg"
                          alt="Post actions"
                          className="three-dots-icon"
                        />  
                      </button>

                      {menuOpenFor === post.id && (
                        <div className="action-menu" ref={menuRef}>
                          <div className="action-item" onClick={() => navigate(`/edit/${post.id}`)}>
                            <svg width="18" height="18" viewBox="0 0 100 100" fill="#222">
                              <path d="m18 84.2c1 0 1.2-.1 2.1-.3l18-3.6c1.9-.5 3.8-1.4 5.3-2.9l43.6-43.6c6.7-6.7 6.7-18.2 0-24.9l-3.7-3.9c-6.7-6.7-18.3-6.7-25 0l-43.6 43.7c-1.4 1.4-2.4 3.4-2.9 5.3l-3.8 18.2c-.5 3.4.5 6.7 2.9 9.1 1.9 1.9 4.7 2.9 7.1 2.9zm3.4-28.3 43.6-43.7c2.9-2.9 8.2-2.9 11 0l3.8 3.8c3.4 3.4 3.4 8.2 0 11.5l-43.5 43.7-18.5 3.1z"></path>
                              <path d="m86.6 90.4h-73.8c-2.9 0-4.8 1.9-4.8 4.8s2.4 4.8 4.8 4.8h73.4c2.9 0 5.3-1.9 5.3-4.8-.1-2.9-2.5-4.8-4.9-4.8z"></path>
                            </svg>
                            Edit post
                          </div>

                          <div className="divider"></div>

                          <div className="action-item delete" onClick={() => handleDeleteFromList(post.id)}>
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

                <Link to={makePostPath(post)} className="post-card">
                  <h4 className="post-card-title">{post.title}</h4>
                  <p className="post-card-excerpt">{finalExcerpt}</p>

                  <div className="post-card-meta">
                    <span className="chip">{post.categoryLabel}</span>
                    <span>•</span>
                    <span>{new Date(post.date).toLocaleDateString("en-GB")}</span>
                  </div>
                </Link>

                {/*Votes*/}
                <div className="vote-bar-below">
                  <button
                    className={`vote-btn up ${voteInfo.userVote === "up" ? "active" : ""}`}
                    onClick={() => handleUpvote(post.id)}
                  >
                    <img
                      src="/icons/thumb-up.svg"
                      alt="Upvote"
                      className="vote-icon"
                    />
                  </button>

                  <span className="vote-count">
                    {voteInfo.score === 0 ? "0" : voteInfo.score}
                  </span>

                  <button
                    className={`vote-btn down ${voteInfo.userVote === "down" ? "active" : ""}`}
                    onClick={() => handleDownvote(post.id)}
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
          })}

          {!query.trim() && totalPages > 1 && (
            <div className="pagination">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Previous
              </button>

              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default BlogPage;