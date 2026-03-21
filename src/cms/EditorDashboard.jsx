import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE, authHeaders, fetchAdminArticles } from "../api";

export default function EditorDashboard() {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function loadArticles() {
    try {
      const data = await fetchAdminArticles();
      setArticles(data);
      setError("");
    } catch (err) {
      setError(err.message);

      if (/401|403|token/i.test(err.message)) {
        localStorage.removeItem("editorToken");
        navigate("/editors/login", { replace: true });
      }
    }
  }

  async function deleteArticle(id) {
    const confirmDelete = window.confirm("Delete this article?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_BASE}/articles/${id}`, {
        method: "DELETE",
        headers: authHeaders()
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Delete failed");
      }

      await loadArticles();
    } catch (err) {
      alert(err.message);
    }
  }

  useEffect(() => {
    loadArticles();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-serif mb-6">Editor Dashboard</h1>

      <Link
        to="/cms/new"
        className="inline-block text-black px-4 py-2 rounded mb-6"
        style={{ backgroundColor: "var(--veritas-red)" }}
      >
        Create New Article
      </Link>

      {error && <div className="mb-4" style={{ color: "var(--veritas-red)" }}>{error}</div>}

      <div className="space-y-4">
        {articles.map((article) => (
          <div
            key={article.id}
            className="bg-neutral-900 border border-neutral-800 p-4 rounded flex justify-between items-center gap-4"
          >
            <div>
              <div className="font-semibold">{article.title}</div>
              <div className="text-sm text-neutral-400">
                {article.status}
                {article.approved ? " | approved" : " | pending approval"}
              </div>
            </div>

            <div className="flex gap-3 shrink-0">
              <Link to={`/article/${article.slug}`} className="text-blue-400">
                View
              </Link>

              <Link to={`/cms/edit/${article.id}`} className="text-yellow-400">
                Edit
              </Link>

              <button
                onClick={() => deleteArticle(article.id)}
                style={{ color: "var(--veritas-red)" }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
