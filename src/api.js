import {
  API_BASE,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  UPLOAD_BACKEND,
  LIVE_MONITOR_URL
} from "./lib/env";

export {
  API_BASE,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  UPLOAD_BACKEND,
  LIVE_MONITOR_URL
};
const ARTICLES_CACHE_KEY = "veritas_articles_cache";
const BREAKING_CACHE_KEY = "veritas_breaking_cache";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout(promise, ms = 25000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);

  return Promise.race([
    promise(controller.signal),
    new Promise((_, reject) => {
      controller.signal.addEventListener(
        "abort",
        () => reject(new Error("Request timed out. Please try again.")),
        { once: true }
      );
    })
  ]).finally(() => clearTimeout(timeoutId));
}

function readCache(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeCache(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures in private mode or quota errors.
  }
}

async function readJson(res) {
  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && typeof window !== "undefined") {
    const errorMessage = String(data.error || "");

    if (/token|unauthorized|forbidden/i.test(errorMessage)) {
      localStorage.removeItem("editorToken");
    }
  }

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export async function fetchJson(path, options = {}, retries = 2) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const res = await withTimeout((signal) =>
        fetch(`${API_BASE}${path}`, {
          ...options,
          signal
        })
      );
      return await readJson(res);
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await sleep(1200 * (attempt + 1));
      }
    }
  }

  throw lastError || new Error("Request failed");
}

export async function fetchArticles() {
  const data = await fetchJson("/articles");
  writeCache(ARTICLES_CACHE_KEY, data);
  return data;
}

export async function fetchBreaking() {
  const data = await fetchJson("/articles/breaking");
  writeCache(BREAKING_CACHE_KEY, data);
  return data;
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

export async function createArticle(payload) {
  return fetchJson("/articles", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });
}

export async function updateArticle(id, payload) {
  return fetchJson(`/articles/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });
}

export async function fetchSubcategories() {
  return fetchJson("/subcategories");
}

export async function createSubcategory(payload) {
  return fetchJson("/subcategories", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });
}

export async function deleteSubcategory(id) {
  return fetchJson(`/subcategories/${id}`, {
    method: "DELETE",
    headers: authHeaders()
  });
}

export async function fetchShorts() {
  return fetchJson("/shorts");
}

export async function createShort(payload) {
  return fetchJson("/shorts", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });
}

export async function fetchAdminShorts() {
  return fetchJson("/shorts/admin", {
    headers: authHeaders()
  });
}

export async function fetchAdminShort(id) {
  return fetchJson(`/shorts/admin/${id}`, {
    headers: authHeaders()
  });
}

export async function updateShort(id, payload) {
  return fetchJson(`/shorts/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });
}

export async function deleteShort(id) {
  return fetchJson(`/shorts/${id}`, {
    method: "DELETE",
    headers: authHeaders()
  });
}

export function authHeaders() {
  const token = localStorage.getItem("editorToken") || "";

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

export function getCloudinaryUploadUrl(resourceType = "image") {
  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
}

// Single upload path for every CMS screen. Returns the stored URL, or throws.
//
// The server generates AVIF/WebP derivatives and returns a JPEG URL, which is
// what goes in the database: hero_image also feeds og:image, and the social
// crawlers cannot decode AVIF.
export async function uploadMedia(file, kind = "image") {
  if (UPLOAD_BACKEND === "cloudinary") {
    const legacyForm = new FormData();
    legacyForm.append("file", file);
    legacyForm.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const legacyRes = await fetch(getCloudinaryUploadUrl(kind), {
      method: "POST",
      body: legacyForm
    });
    const legacyData = await legacyRes.json();

    if (!legacyRes.ok || !legacyData.secure_url) {
      throw new Error(legacyData.error?.message || `${kind} upload failed`);
    }

    return legacyData.secure_url;
  }

  const token = localStorage.getItem("editorToken") || "";
  const formData = new FormData();
  formData.append("file", file);
  formData.append("kind", kind);

  // No Content-Type header: the browser has to set the multipart boundary.
  const res = await fetch(`${API_BASE}/media`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.secure_url) {
    throw new Error(data.error || `${kind} upload failed`);
  }

  return data.secure_url;
}

export function loadCachedArticles() {
  return readCache(ARTICLES_CACHE_KEY);
}

export function loadCachedBreaking() {
  return readCache(BREAKING_CACHE_KEY);
}
