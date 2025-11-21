import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NewPostPage.css";

function NewPostPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    category: "cs-journey",
    excerpt: "",
    content: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    console.log("New post data:", form);

    alert("Post creation coming soon. Form data logged in console.");
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

        <h1 className="new-post-title">Write a new post</h1>
        <p className="new-post-subtitle">
          Capture a memory from your journey.
        </p>

        <form className="new-post-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Title</span>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="How my CS journey actually started…"
              required
            />
          </label>

          <label className="field">
            <span>Category</span>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
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
              name="excerpt"
              value={form.excerpt}
              onChange={handleChange}
              placeholder="One sentence summary for the list view…"
              required
            />
          </label>

          <label className="field">
            <span>Post content</span>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={10}
              placeholder="Write your story here…"
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
              Save draft (coming soon)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewPostPage;