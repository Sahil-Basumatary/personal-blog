import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NewPostPage.css";

function NewPostPage() {
  const navigate = useNavigate();

  const isOwner = true;
  if (!isOwner) return navigate("/");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("cs-journey");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    const finalExcerpt =
      excerpt.trim() !== ""
        ? excerpt.trim()
        : content.split("\n")[0].slice(0, 140) + "...";

    const newPost = {
      id: Date.now(),
      title,
      category,
      categoryLabel:
        category === "cs-journey"
          ? "My CS Journey"
          : category === "life-in-london"
          ? "Life in London"
          : category === "motivation"
          ? "Motivation"
          : "Tools & Resources",
      excerpt: finalExcerpt,
      content,
      date: new Date().toISOString(),
      featured: false,
    };

    const existing = JSON.parse(localStorage.getItem("user_posts") || "[]");
    localStorage.setItem("user_posts", JSON.stringify([...existing, newPost]));

    navigate("/blog");
  }

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
          <label className="field">
            <span>Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

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
          </label>

          <label className="field">
            <span>Short description</span>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="One sentence summary…"
            />
          </label>

          <label className="field">
            <span>Content</span>
            <textarea
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </label>

          <div className="form-actions">
            <button
              type="button"
              className="ghost-btn"
              onClick={() => navigate("/blog")}
            >
              Cancel
            </button>

            <button type="submit" className="primary-btn">
              Publish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewPostPage;