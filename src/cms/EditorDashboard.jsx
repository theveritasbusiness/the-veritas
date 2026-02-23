import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function EditorDashboard() {
  const [articles, setArticles] = useState([]);

  async function loadArticles() {
    const res = await fetch("http://localhost:5000/articles");
    const data = await res.json();
    setArticles(data);
  }

  async function deleteArticle(id) {
    const confirmDelete = window.confirm("Delete this article?");
    if (!confirmDelete) return;

    await fetch(`http://localhost:5000/articles/${id}`, {
  method: "DELETE",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("editorToken")}`
  }
});

    loadArticles();
  }

  useEffect(() => {
    loadArticles();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">

      <h1 className="text-3xl font-serif mb-6">Editor Dashboard</h1>

      <Link
        to="/cms/new"
        className="inline-block bg-red-600 text-black px-4 py-2 rounded mb-6"
      >
        ➕ Create New Article
      </Link>

      {/* ================= ARTICLE LIST ================= */}
      <div className="space-y-4">

        {articles.map(article => (
          <div
            key={article.id}
            className="bg-neutral-900 border border-neutral-800 p-4 rounded flex justify-between items-center"
          >

            <div>
              <div className="font-semibold">{article.title}</div>
              <div className="text-sm text-neutral-400">
                {article.status}
              </div>
            </div>

            <div className="flex gap-3">

              <Link
                to={`/article/${article.slug}`}
                className="text-blue-400"
              >
                View
              </Link>

              <Link
  to={`/cms/edit/${article.id}`}
  className="text-yellow-400"
>
  Edit
</Link>

              <button
                onClick={() => deleteArticle(article.id)}
                className="text-red-500"
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