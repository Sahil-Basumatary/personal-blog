import { useState, useEffect, useCallback } from "react";
import "./Toast.css";

let toastId = 0;
const listeners = new Set();

export function showToast(message, type = "info", duration = 4000) {
  const toast = { id: ++toastId, message, type, duration };
  listeners.forEach((fn) => fn(toast));
  return toast.id;
}

function ToastItem({ toast, onDismiss }) {
  const [exiting, setExiting] = useState(false);
  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 280);
  }, [toast.id, onDismiss]);
  useEffect(() => {
    if (toast.duration <= 0) return;
    const timer = setTimeout(dismiss, toast.duration);
    return () => clearTimeout(timer);
  }, [toast.duration, dismiss]);
  return (
    <div
      className={`toast-item toast-${toast.type} ${exiting ? "toast-exit" : ""}`}
      role="alert"
      aria-live="assertive"
    >
      <span className="toast-dot" />
      <p className="toast-message">{toast.message}</p>
      <button
        type="button"
        className="toast-close"
        aria-label="Dismiss notification"
        onClick={dismiss}
      >
        &times;
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    const handler = (toast) => {
      setToasts((prev) => [...prev.slice(-4), toast]);
    };
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);
  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container" aria-label="Notifications">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={remove} />
      ))}
    </div>
  );
}
