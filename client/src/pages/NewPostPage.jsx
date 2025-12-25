import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./NewPostPage.css";
import { createPost } from "../api/posts";
import { useUser, useAuth } from "@clerk/clerk-react";
import { OWNER_USER_ID } from "../config/authOwner";

function NewPostPage() {
  const navigate = useNavigate();
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const isOwner = isSignedIn && user?.id === OWNER_USER_ID;

  useEffect(() => {
    if (isLoaded && !isOwner) {
      navigate("/", { replace: true });
    }
  }, [isLoaded, isOwner, navigate]);

  const savedDraft = JSON.parse(localStorage.getItem("new_post_draft") || "{}");

  const [title, setTitle] = useState(savedDraft.title || "");
  const [category, setCategory] = useState(savedDraft.category || "cs-journey");
  const [excerpt, setExcerpt] = useState(savedDraft.excerpt || "");
  const [content, setContent] = useState(savedDraft.content || "");

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const draft = { title, category, excerpt, content };
    localStorage.setItem("new_post_draft", JSON.stringify(draft));
  }, [title, category, excerpt, content]);

  if (!isLoaded) {
    return (
      <div className="new-post-page">
        <div className="new-post-card">
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  if (!isOwner) return null;

  function validate() {
    const err = {};
    if (title.trim().length < 3) err.title = "Title must be at least 3 characters.";
    if (content.trim().length < 30)
      err.content = "Content must be at least 30 characters.";
    if (!category) err.category = "Category is required.";

    setErrors(err);
    return Object.keys(err).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const finalExcerpt =
      excerpt.trim() !== ""
        ? excerpt.trim()
        : content.split("\n")[0].slice(0, 140) + "...";

    const categoryLabel =
      category === "cs-journey"
        ? "My CS Journey"
        : category === "life-in-london"
        ? "Life in London"
        : category === "motivation"
        ? "Motivation"
        : "Tools & Resources";

    const payload = {
      title: title.trim(),
      content: content.trim(),
      category,
      categoryLabel,
      excerpt: finalExcerpt,
      isFeatured: false,
    };

    try {
      const token = await getToken();
      const created = await createPost(payload, token);

      // Clear draft once backend succeeds
      localStorage.removeItem("new_post_draft");

      // If backend returns slug or _id, go straight to that post
      if (created && (created.slug || created._id)) {
        const slugOrId = created.slug || created._id;
        navigate(`/blog/${slugOrId}`);
      } else {
        navigate("/blog");
      }
    } catch (err) {
      console.error("Failed to create post on backend", err);
      alert(
        "Failed to publish post. Your draft is saved locally — please try again later."
      );
    }
  }

  function handleCancel() {
    localStorage.removeItem("new_post_draft");
    navigate("/blog");
  }

  const isValid = title.trim().length >= 3 && content.trim().length >= 30;

  return (
    <div className="new-post-page">
      <div className="new-post-card">
        <button
          className="back-link"
          type="button"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <h1 className="new-post-title">Write a New Post</h1>
        <p className="new-post-subtitle">Capture a memory from your journey.</p>

        <form className="new-post-form" onSubmit={handleSubmit}>

          {/* Title */}
          <label className="field">
            <span>Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && (
              <p style={{ color: "#dc2626", fontSize: "0.85rem" }}>
                {errors.title}
              </p>
            )}
          </label>

          {/* Category */}
          <label className="field">
            <span>Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="cs-journey">My CS Journey</option>
              <option value="life-in-london">Life in London</option>
              <option value="motivation">Motivation</option>
              <option value="tools">Tools & Resources</option>
            </select>

            {errors.category && (
              <p style={{ color: "#dc2626", fontSize: "0.85rem" }}>
                {errors.category}
              </p>
            )}
          </label>

          {/* Short Description */}
          <label className="field">
            <span>Short description</span>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="One sentence summary…"
            />
          </label>

          {/* Content */}
          <label className="field">
            <span>Content</span>
            <textarea
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            {errors.content && (
              <p style={{ color: "#dc2626", fontSize: "0.85rem" }}>
                {errors.content}
              </p>
            )}
          </label>

          <div className="form-actions">
            <button
              type="button"
              className="ghost-btn"
              onClick={handleCancel}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-btn"
              disabled={!isValid}
              style={{ opacity: isValid ? 1 : 0.5, cursor: isValid ? "pointer" : "not-allowed" }}
            >
              Publish
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default NewPostPage;