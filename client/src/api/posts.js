const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

function buildHeaders(token) {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

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

export async function createPost(payload, token) {
  const res = await fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw new Error("Failed to create post");
  }
  return res.json();
}

export async function updatePost(id, payload, token) {
  const res = await fetch(`${API_BASE_URL}/posts/${id}`, {
    method: "PUT",
    headers: buildHeaders(token),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw new Error("Failed to update post");
  }
  return res.json();
}

export async function deletePost(id, token) {
  const res = await fetch(`${API_BASE_URL}/posts/${id}`, {
    method: "DELETE",
    headers: buildHeaders(token)
  });
  if (!res.ok) {
    throw new Error("Failed to delete post");
  }
  return res.json();
}

export async function incrementPostViews(id) {
  const res = await fetch(`${API_BASE_URL}/posts/${id}/view`, {
    method: "POST"
  });
  if (!res.ok) {
    throw new Error("Failed to increment views");
  }
  return res.json();
}

export async function voteOnPost(id, direction, token) {
  const res = await fetch(`${API_BASE_URL}/posts/${id}/vote`, {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify({ direction })
  });
  if (!res.ok) {
    throw new Error("Failed to vote on post");
  }
  return res.json();
}