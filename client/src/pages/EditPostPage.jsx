import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./NewPostPage.css"; 
import { fetchPostById, updatePost } from "../api/posts";
import { useAuth } from "@clerk/clerk-react";

function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { getToken } = useAuth();
  const [slug, setSlug] = useState(null);

  const isOwner = true; // TODO: replace with real auth later

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("cs-journey");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!isOwner) {
      navigate("/");
      return;
    }

    let active = true;

    async function loadPost() {
      try {
        // Try backend first
        const apiPost = await fetchPostById(id);
        if (!active) return;

        setTitle(apiPost.title || "");
        setCategory(apiPost.category || "cs-journey");
        setExcerpt(apiPost.excerpt || "");
        setContent(apiPost.content || "");
        setSlug(apiPost.slug || apiPost._id);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load post from backend, falling back to local", err);
        if (!active) return;

        // Fallback: local user_posts 
        const existing = JSON.parse(localStorage.getItem("user_posts") || "[]");
        const target = existing.find((p) => String(p.id) === String(id));

        if (!target) {
          setNotFound(true);
        } else {
          setTitle(target.title || "");
          setCategory(target.category || "cs-journey");
          setExcerpt(target.excerpt || "");
          setContent(target.content || "");
          setSlug(target.slug || target.id);
        }
        setLoading(false);
      }
    }

    loadPost();
    return () => {
      active = false;
    };
  }, [id, isOwner, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    const categoryLabel =
      category === "cs-journey"
        ? "My CS Journey"
        : category === "life-in-london"
        ? "Life in London"
        : category === "motivation"
        ? "Motivation"
        : "Tools & Resources";

    const finalExcerpt =
      excerpt.trim() !== ""
        ? excerpt.trim()
        : content.split("\n")[0].slice(0, 140) + "...";

    const payload = {
      title: title.trim(),
      content: content.trim(),
      category,
      categoryLabel,
      excerpt: finalExcerpt,
    };

    try {
      // Try backend update
      await updatePost(id, payload);
      navigate(`/blog/${slug || id}`);
    } catch (err) {
      console.error("Failed to update post on backend, err:", err);

      // Fallback: local storage
      const existing = JSON.parse(localStorage.getItem("user_posts") || "[]");

      const updated = existing.map((p) =>
        String(p.id) === String(id)
          ? {
              ...p,
              title,
              category,
              excerpt: finalExcerpt,
              content,
              isUserPost: true,
              updatedAt: new Date().toISOString(),
            }
          : p
      );

      localStorage.setItem("user_posts", JSON.stringify(updated));
      navigate(`/blog/${id}`);
    }
  }

  if (!isOwner) return null;

  if (loading) {
    return (
      <div className="new-post-page">
        <div className="new-post-card">
          <p>Loading post…</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="new-post-page">
        <div className="new-post-card">
          <p>This post wasn't created via your blog writer, so it can't be edited here.</p>
          <button className="primary-btn" onClick={() => navigate("/blog")}>
            Back to blog
          </button>
        </div>
      </div>
    );
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

        <h1 className="new-post-title">Edit post</h1>
        <p className="new-post-subtitle">Edit your story.</p>

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
              onClick={() => navigate(`/blog/${slug || id}`)}
            >
              Cancel
            </button>

            <button type="submit" className="primary-btn">
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPostPage;