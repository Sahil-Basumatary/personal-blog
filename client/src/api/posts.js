const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

// public routes

export async function fetchPosts({ search = "", category = "" } = {}) {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (category) params.append("category", category);

  const res = await fetch(`${API_BASE_URL}/posts?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to get posts");
  }
  return res.json();
}

export async function fetchPostById(id) {
  const res = await fetch(`${API_BASE_URL}/posts/${id}`);
  if (!res.ok) {
    throw new Error("Failed to get post");
  }
  return res.json();
}

export async function incrementPostViews(id) {
  const res = await fetch(`${API_BASE_URL}/posts/${id}/view`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error("Failed to increment views");
  }
  return res.json();
}

// helper for protected routes

async function authedJson(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include", 
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Request failed: ${res.status} ${res.statusText} – ${text || "no body"}`
    );
  }

  return res.json();
}

//protected routes

export async function createPost(payload) {
  return authedJson("/posts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updatePost(id, payload) {
  return authedJson(`/posts/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deletePost(id) {
  return authedJson(`/posts/${id}`, {
    method: "DELETE",
  });
}

export async function voteOnPost(id, direction) {
  return authedJson(`/posts/${id}/vote`, {
    method: "POST",
    body: JSON.stringify({ direction }),
  });
}