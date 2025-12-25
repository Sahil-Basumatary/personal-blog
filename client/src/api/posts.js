const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

export async function fetchPosts({
  search = "",
  category = "",
  page = 1,
  limit = 10,
} = {}) {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (category) params.append("category", category);
  params.append("page", String(page));
  params.append("limit", String(limit));

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

async function authedJson(path, options = {}, token) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include", 
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Request failed: ${res.status} ${res.statusText} – ${text || "no body"}`
    );
  }

  return res.json();
}

export async function createPost(payload, token) {
  return authedJson("/posts", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token);
}

export async function updatePost(id, payload, token) {
  return authedJson(
    `/posts/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    token
  );
}

export async function deletePost(id, token) {
  return authedJson(
    `/posts/${id}`,
    {
      method: "DELETE",
    },
    token
  );
}

export async function voteOnPost(id, direction, token) {
  return authedJson(`/posts/${id}/vote`, {
    method: "POST",
    body: JSON.stringify({ direction }),
  }, token);
}