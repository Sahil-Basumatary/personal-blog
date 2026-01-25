import { useState } from "react";
import { subscribeToNewsletter } from "../api/subscribers";
import "./SubscribeSection.css";

function SubscribeSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setStatus("loading");
    setMessage("");
    const result = await subscribeToNewsletter(trimmed);
    if (result.ok) {
      setStatus("success");
      setMessage(result.message);
      setEmail("");
    } else if (result.status === 409) {
      setStatus("info");
      setMessage(result.message);
    } else {
      setStatus("error");
      setMessage(result.message);
    }
  }

  const isLoading = status === "loading";

  return (
    <section className="subscribe">
      <h3>Be a part of my journey!</h3>
      <p>
        Get updates when I share something new which will be but not limited to reflections, lessons,
        and little victories along the way!!!
      </p>
      <form className="subscribe-form" onSubmit={handleSubmit}>
        <input
          type="email"
          className="subscribe-input"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle" && status !== "loading") setStatus("idle");
          }}
          disabled={isLoading}
          required
        />
        <button
          type="submit"
          className={`sub-btn${isLoading ? " sub-btn--loading" : ""}`}
          disabled={isLoading}
        >
          {isLoading ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
      {message && (
        <p className={`subscribe-message subscribe-message--${status}`}>
          {message}
        </p>
      )}
      <div className="subscribe-btns">
        <button
          className="linkedin-btn"
          onClick={() =>
            window.open("https://www.linkedin.com/in/sahil-basumatary/", "_blank")
          }
        >
          Connect with me on LinkedIn
        </button>
      </div>
    </section>
  );
}

export default SubscribeSection;
