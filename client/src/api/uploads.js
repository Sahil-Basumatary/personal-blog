const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

export async function uploadImage(file, token) {
  const formData = new FormData();
  formData.append("image", file);
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE_URL}/uploads`, {
    method: "POST",
    credentials: "include",
    headers,
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let message = "Image upload failed";
    if (res.status === 401) message = "Sign in required to upload images";
    if (res.status === 403) message = "Only the blog owner can upload images";
    if (res.status === 413) message = "Image file is too large";
    if (res.status === 415) message = "Unsupported image format";
    const err = new Error(message);
    err.status = res.status;
    err.details = text;
    throw err;
  }
  return res.json();
}

