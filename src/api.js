const API_BASE = "https://veritas-backend-dktb.onrender.com";

export async function fetchArticles() {
  const res = await fetch(`${API_BASE}/articles`);
  return res.json();
}

export async function fetchBreaking() {
  const res = await fetch(`${API_BASE}/articles/breaking`);
  return res.json();
}
export function authHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("editorToken")}`
  };
}
fetch(`${API_BASE}/articles`, {
  method: "POST",
  headers: authHeaders(),
  body: JSON.stringify(data)
});