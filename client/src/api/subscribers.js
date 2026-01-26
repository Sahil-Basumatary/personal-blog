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

export async function confirmSubscription(token) {
  const res = await fetch(`${API_BASE_URL}/subscribers/confirm/${token}`);
  const data = await res.json().catch(() => ({}));
  return {
    ok: res.ok,
    status: res.status,
    message: data.message || (res.ok ? "Confirmed!" : "Something went wrong"),
  };
}

export async function unsubscribeEmail(token) {
  const res = await fetch(`${API_BASE_URL}/subscribers/unsubscribe/${token}`);
  const data = await res.json().catch(() => ({}));
  return {
    ok: res.ok,
    status: res.status,
    message: data.message || (res.ok ? "Unsubscribed." : "Something went wrong"),
  };
}

export async function deleteSubscriberData(token) {
  const res = await fetch(`${API_BASE_URL}/subscribers/delete/${token}`, {
    method: "DELETE",
  });
  const data = await res.json().catch(() => ({}));
  return {
    ok: res.ok,
    status: res.status,
    message: data.message || (res.ok ? "Data deleted." : "Something went wrong"),
  };
}

