import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "../lib/router";
import {
  API_BASE,
  authHeaders,
  deleteSubcategory,
  fetchAdminArticle,
  deleteShort,
  fetchAdminArticles,
  fetchAdminShorts,
  fetchSubcategories,
  updateArticle
} from "../api";

export default function EditorDashboard() {
  const [articles, setArticles] = useState([]);
  const [shorts, setShorts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
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

  async function loadShorts() {
    try {
      const data = await fetchAdminShorts();
      setShorts(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err.message);

      if (/401|403|token/i.test(err.message)) {
        localStorage.removeItem("editorToken");
        navigate("/editors/login", { replace: true });
      }
    }
  }

  async function loadSubcategories() {
    try {
      const data = await fetchSubcategories();
      setSubcategories(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err.message);
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

  async function handleDeleteShort(id) {
    const confirmDelete = window.confirm("Delete this short?");
    if (!confirmDelete) return;

    try {
      await deleteShort(id);
      await loadShorts();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDeleteSubcategory(id) {
    const confirmDelete = window.confirm("Delete this subcategory?");
    if (!confirmDelete) return;

    try {
      await deleteSubcategory(id);
      await loadSubcategories();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleConvertLiveArticle(id) {
    const confirmConvert = window.confirm("Convert this live article into a timeline article?");
    if (!confirmConvert) return;

    try {
      const article = await fetchAdminArticle(id);
      const liveUpdates = Array.isArray(article?.live_updates) ? article.live_updates : [];
      const contentBlocks = liveUpdates.flatMap((update) => {
        const blocks = [];

        if (update?.heading) {
          blocks.push({ type: "subheading", text: update.heading });
        }

        if (update?.description) {
          blocks.push({ type: "paragraph", text: update.description });
        }

        if (update?.tweet_url) {
          blocks.push({ type: "tweet", href: update.tweet_url });
        }

        return blocks;
      });

      await updateArticle(id, {
        title: article.title || "",
        subheadline: article.subheadline || "",
        category: article.category || "",
        subcategory: article.subcategory || "",
        subcategory_slug: article.subcategory_slug || "",
        hero_image: article.hero_image || "",
        hero_caption: article.hero_caption || "",
        hero_focus: article.hero_focus || "auto",
        hero_crop: article.hero_crop || null,
        author_name: article.author_name || "",
        hashtags: Array.isArray(article.hashtags) ? article.hashtags : [],
        content_blocks: contentBlocks,
        paragraphs: contentBlocks.filter((block) => block.type === "paragraph").map((block) => block.text),
        bibliography: article.bibliography || "",
        is_breaking: article.is_breaking || false,
        show_on_slider: article.show_on_slider ?? false,
        show_on_category_slider: article.show_on_category_slider ?? false,
        is_editorial: article.is_editorial ?? false,
        is_live: false,
        live_updates: []
      });

      await loadArticles();
    } catch (err) {
      alert(err.message);
    }
  }

  useEffect(() => {
    loadArticles();
    loadShorts();
    loadSubcategories();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-serif mb-6">Editor Dashboard</h1>

      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          to="/cms/new"
          className="inline-block rounded px-4 py-2 text-black"
          style={{ backgroundColor: "var(--veritas-red)" }}
        >
          Create New Article
        </Link>

        <Link
          to="/cms/live/new"
          className="inline-block rounded border border-neutral-700 px-4 py-2 text-white"
        >
          Create Live Article
        </Link>

        <Link
          to="/cms/subcategories/new"
          className="inline-block rounded border border-neutral-700 px-4 py-2 text-white"
        >
          Create New Subcategory
        </Link>

        <Link
          to="/cms/shorts/new"
          className="inline-block rounded border border-neutral-700 px-4 py-2 text-white"
        >
          Add Shorts
        </Link>
      </div>

      {error && <div className="mb-4" style={{ color: "var(--veritas-red)" }}>{error}</div>}

      <div className="mb-10 space-y-4">
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
                {article.is_editorial ? " | editorial" : ""}
                {article.is_live ? " | live" : ""}
              </div>
            </div>

            <div className="flex gap-3 shrink-0">
              <Link to={`/article/${article.slug}`} className="text-blue-400">
                View
              </Link>

              <Link to={article.is_live ? `/cms/live/edit/${article.id}` : `/cms/edit/${article.id}`} className="text-yellow-400">
                Edit
              </Link>

              {article.is_live ? (
                <button
                  onClick={() => handleConvertLiveArticle(article.id)}
                  className="text-orange-300"
                >
                  Convert to Timeline
                </button>
              ) : null}

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

      <div className="mt-12">
        <h2 className="mb-4 font-serif text-2xl">Subcategories</h2>
        <div className="space-y-4">
          {subcategories.map((subcategory) => (
            <div
              key={subcategory.id || subcategory.slug}
              className="bg-neutral-900 border border-neutral-800 p-4 rounded flex justify-between items-center gap-4"
            >
              <div>
                <div className="font-semibold">{subcategory.name}</div>
                <div className="mt-1 text-sm text-neutral-400">{subcategory.category}</div>
              </div>

              <button
                onClick={() => handleDeleteSubcategory(subcategory.id)}
                style={{ color: "var(--veritas-red)" }}
              >
                Delete
              </button>
            </div>
          ))}

          {subcategories.length === 0 ? (
            <div className="rounded border border-dashed border-neutral-800 px-4 py-5 text-sm text-neutral-500">
              No subcategories added yet.
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="mb-4 font-serif text-2xl">Latest Videos / Shorts</h2>
        <div className="space-y-4">
          {shorts.map((short) => (
            <div
              key={short.id}
              className="bg-neutral-900 border border-neutral-800 p-4 rounded flex justify-between items-center gap-4"
            >
              <div>
                <div className="font-semibold">{short.platform === "youtube" ? "YouTube Short" : "Instagram Reel"}</div>
                <div className="mt-1 break-all text-sm text-neutral-400">{short.href}</div>
              </div>

              <div className="flex gap-3 shrink-0">
                <a href={short.href} target="_blank" rel="noreferrer" className="text-blue-400">
                  View
                </a>

                <Link to={`/cms/shorts/edit/${short.id}`} className="text-yellow-400">
                  Edit
                </Link>

                <button
                  onClick={() => handleDeleteShort(short.id)}
                  style={{ color: "var(--veritas-red)" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {shorts.length === 0 ? (
            <div className="rounded border border-dashed border-neutral-800 px-4 py-5 text-sm text-neutral-500">
              No shorts added yet.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
