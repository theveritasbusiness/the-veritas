export const API_BASE =
  import.meta.env.VITE_API_BASE || "https://veritas-backend-dktb.onrender.com";

export const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dft7kdsw6";

export const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "veritas_uploads";

export const LIVE_MONITOR_URL = "/live/";

async function readJson(res) {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export async function fetchJson(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  return readJson(res);
}

export async function fetchArticles() {
  return fetchJson("/articles");
}

export async function fetchBreaking() {
  return fetchJson("/articles/breaking");
}

export async function fetchArticleBySlug(slug) {
  return fetchJson(`/articles/${slug}`);
}

export async function fetchAdminArticles() {
  return fetchJson("/articles/admin", {
    headers: authHeaders()
  });
}

export async function fetchAdminArticle(id) {
  return fetchJson(`/articles/admin/${id}`, {
    headers: authHeaders()
  });
}

export function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("editorToken") || ""}`
  };
}

export function getCloudinaryUploadUrl() {
  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
}
