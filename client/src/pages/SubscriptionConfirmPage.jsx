import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { confirmSubscription } from "../api/subscribers";
import "./SubscriptionConfirmPage.css";

function SubscriptionConfirmPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    async function confirm() {
      const result = await confirmSubscription(token);
      if (result.ok) {
        setStatus("success");
      } else if (result.status === 400 || result.status === 404) {
        setStatus("error");
      } else {
        setStatus("error");
      }
      setMessage(result.message);
    }
    confirm();
  }, [token]);

  useEffect(() => {
    if (status === "loading") return;
    if (countdown <= 0) {
      navigate("/");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [status, countdown, navigate]);

  return (
    <div className="confirm-page">
      <div className="confirm-card">
        {status === "loading" && (
          <>
            <div className="confirm-spinner" />
            <p className="confirm-text">Confirming your subscription...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="confirm-icon confirm-icon--success">✓</div>
            <h2 className="confirm-title">You're all set!</h2>
            <p className="confirm-text">{message}</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="confirm-icon confirm-icon--error">✕</div>
            <h2 className="confirm-title">Something went wrong</h2>
            <p className="confirm-text">{message}</p>
          </>
        )}
        {status !== "loading" && (
          <div className="confirm-nav">
            <button className="confirm-btn" onClick={() => navigate("/")}>
              Return to Homepage
            </button>
            <p className="confirm-countdown">Redirecting in {countdown}...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubscriptionConfirmPage;

