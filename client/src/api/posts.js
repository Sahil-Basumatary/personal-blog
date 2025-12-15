const API_BASE_URL = "http://localhost:5001/api";

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

export async function createPost(payload) {
  const res = await fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw new Error("Failed to create post");
  }
  return res.json();
}

export async function updatePost(id, payload) {
  const res = await fetch(`${API_BASE_URL}/posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw new Error("Failed to update post");
  }
  return res.json();
}

export async function deletePost(id) {
  const res = await fetch(`${API_BASE_URL}/posts/${id}`, {
    method: "DELETE"
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

export async function voteOnPost(id, direction) {
  const res = await fetch(`${API_BASE_URL}/posts/${id}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ direction })
  });
  if (!res.ok) {
    throw new Error("Failed to vote on post");
  }
  return res.json();
}