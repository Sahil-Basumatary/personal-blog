import { useParams } from "react-router-dom";
import posts from "../data/posts";
import ReadingProgressBar from "../components/ReadingProgressBar";
import "./SingleBlogPage.css";

function SingleBlogPage() {
  const { id } = useParams();
  const post = posts.find((p) => p.id === Number(id));

  if (!post) {
    return <div className="not-found">Post not found.</div>;
  }

  return (
    <div className="single-container">
      <ReadingProgressBar />

      <div className="single-header">
        <a href="/blog" className="back-link">
          ← Back to all posts
        </a>
        <h1 className="single-title">{post.title}</h1>

        <div className="single-meta">
          <span>{post.category}</span>
          <span>•</span>
          <span>{post.date}</span>
        </div>
      </div>

      <article className="single-content">
        {post.content.split("\n").map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </article>
    </div>
  );
}

export default SingleBlogPage;