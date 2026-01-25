const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

export async function subscribeToNewsletter(email) {
  const res = await fetch(`${API_BASE_URL}/subscribers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json().catch(() => ({}));
  return {
    ok: res.ok,
    status: res.status,
    message: data.message || (res.ok ? "Subscribed!" : "Something went wrong"),
  };
}

