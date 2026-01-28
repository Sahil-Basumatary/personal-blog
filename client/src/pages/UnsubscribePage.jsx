import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { unsubscribeEmail, deleteSubscriberData } from "../api/subscribers";
import "./UnsubscribePage.css";

function UnsubscribePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [deleteStatus, setDeleteStatus] = useState("idle");

  useEffect(() => {
    async function unsubscribe() {
      const result = await unsubscribeEmail(token);
      if (result.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
      setMessage(result.message);
    }
    unsubscribe();
  }, [token]);

  useEffect(() => {
    if (status === "loading" || deleteStatus === "loading") return;
    if (countdown <= 0) {
      navigate("/");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [status, deleteStatus, countdown, navigate]);

  async function handleDelete() {
    setDeleteStatus("loading");
    setCountdown(5);
    const result = await deleteSubscriberData(token);
    if (result.ok) {
      setDeleteStatus("success");
      setMessage(result.message);
    } else {
      setDeleteStatus("error");
      setMessage(result.message);
    }
  }

  const showDeleteOption = status === "success" && deleteStatus === "idle";

  return (
    <div className="unsub-page">
      <div className="unsub-card">
        {status === "loading" && (
          <>
            <div className="unsub-spinner" />
            <p className="unsub-text">Processing your request...</p>
          </>
        )}
        {status === "success" && deleteStatus === "idle" && (
          <>
            <div className="unsub-icon unsub-icon--success">✓</div>
            <h2 className="unsub-title">Unsubscribed</h2>
            <p className="unsub-text">{message}</p>
            <p className="unsub-subtext">
              Your data will be automatically deleted in 30 days.
            </p>
          </>
        )}
        {status === "success" && deleteStatus === "loading" && (
          <>
            <div className="unsub-spinner" />
            <p className="unsub-text">Deleting your data...</p>
          </>
        )}
        {status === "success" && deleteStatus === "success" && (
          <>
            <div className="unsub-icon unsub-icon--success">✓</div>
            <h2 className="unsub-title">Data Deleted</h2>
            <p className="unsub-text">{message}</p>
          </>
        )}
        {status === "success" && deleteStatus === "error" && (
          <>
            <div className="unsub-icon unsub-icon--error">✕</div>
            <h2 className="unsub-title">Deletion Failed</h2>
            <p className="unsub-text">{message}</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="unsub-icon unsub-icon--error">✕</div>
            <h2 className="unsub-title">Something went wrong</h2>
            <p className="unsub-text">{message}</p>
          </>
        )}
        {status !== "loading" && deleteStatus !== "loading" && (
          <div className="unsub-nav">
            {showDeleteOption && (
              <button className="unsub-btn unsub-btn--delete" onClick={handleDelete}>
                Delete my data now
              </button>
            )}
            <button className="unsub-btn" onClick={() => navigate("/")}>
              Return to Homepage
            </button>
            <p className="unsub-countdown">Redirecting in {countdown}...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UnsubscribePage;

