const API_BASE = "http://localhost:5000";

export async function fetchArticles() {
  const res = await fetch(`${API_BASE}/articles`);
  return res.json();
}

export async function fetchBreaking() {
  const res = await fetch(`${API_BASE}/articles/breaking`);
  return res.json();
}