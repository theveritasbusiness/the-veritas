import React, { useState, useEffect } from "react";
import { fetchArticles, fetchBreaking } from "./api";
import logoAsset from './assets/Logo_Edit_4.png'; 
import { useSearchParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function formatAge(article) {
  if (article.published_ago) {
    const h = article.published_ago.hours || 0;
    const m = article.published_ago.minutes || 0;
    return `${h}h ${m}m ago`;
  }

  if (article.age) {
    const h = article.age.hours || 0;
    const m = article.age.minutes || 0;
    return `${h}h ${m}m ago`;
  }

  return "";
}
export default function TheVeritasShowcase() {
  /* --------------------------------------------------
     HERO SLIDER
  -------------------------------------------------- */
const [articles, setArticles] = useState([]);
const [breaking, setBreaking] = useState([]);
const [searchParams] = useSearchParams();
const navigate = useNavigate();

const searchQuery = searchParams.get("search") || "";

const selectedCategory = searchParams.get("category");

/* ---------------- FILTER: SEARCH ---------------- */
const searchedArticles = articles.filter((a) => {
  const query = (searchQuery || "").toLowerCase();
  return (
    a.title?.toLowerCase().includes(query) ||
    a.category?.toLowerCase().includes(query) ||
    a.paragraphs?.some(p => 
  typeof p === "string" && p.toLowerCase().includes(query)
)
  );
});

/* ---------------- FILTER: CATEGORY ---------------- */
const finalArticles = searchedArticles.filter((a) => {
  if (!selectedCategory || selectedCategory === "Home") return true;

  return (
    a.category &&
    a.category.toLowerCase() === selectedCategory.toLowerCase()
  );
});

/* ---------------- SLIDER ---------------- */
const sliderArticles = finalArticles.filter(a => a.show_on_slider === true);

/* ---------------- HERO + FEATURED ---------------- */
const heroArticle = finalArticles.length ? finalArticles[0] : null;
const featuredArticle = finalArticles.length > 1 ? finalArticles[1] : null;
  /* --------------------------------------------------
     DATA
  -------------------------------------------------- */

const [modal, setModal] = useState(null);
useEffect(() => {
  async function loadData() {
    try {
      const allArticles = await fetchArticles();
      const breakingArticles = await fetchBreaking();

      setArticles(allArticles);
      setBreaking(breakingArticles);
    } catch (err) {
      console.error("Failed to load articles:", err);
    }
  }

  loadData();
}, []);


  /* --------------------------------------------------
     RENDER
  -------------------------------------------------- */
  return (
    <div className="min-h-screen bg-black text-white antialiased font-sans">

      {/* ================= BREAKING ================= */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded px-3 py-2 flex gap-4">
          <div className="text-red-500 font-bold text-sm">BREAKING</div>
          <div className="overflow-hidden whitespace-nowrap flex-1">
            <div className="ticker">
              {breaking.map(b => b.title).join(" • ")}
            </div>
          </div>
        </div>
      </div>

      {/* ================= HERO ================= */}
      {heroArticle && (
<header className="max-w-6xl mx-auto px-4 mt-6">
  <Link to={`/article/${heroArticle.slug}`}>
    <div className="relative h-64 md:h-96 rounded overflow-hidden cursor-pointer">

      {/* IMAGE */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroArticle?.hero_image || "https://via.placeholder.com/1200x600"})`
        }}
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex items-end">
        <div>
          <div className="text-red-500 font-semibold">
            {heroArticle?.is_breaking ? "BREAKING" : "TOP STORY"}
          </div>

          <h1 className="text-3xl md:text-5xl font-serif font-bold">
            {heroArticle?.title || "Loading..."}
          </h1>

          <p className="text-neutral-300 mt-2 max-w-2xl">
            {heroArticle?.paragraphs?.[0]?.slice(0, 140)}
          </p>
        </div>
      </div>

    </div>
  </Link>
</header>
      )}
      {/* ================= MAIN ================= */}
      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-12 gap-6">
{finalArticles.length === 0 && (
  <div className="col-span-12 text-center text-neutral-400 py-20">
    No articles found.
  </div>
)}
        {/* LATEST */}
        <aside className="md:col-span-3">
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded">
            <h3 className="font-serif text-2xl mb-3 border-b pb-2">
              Latest News
            </h3>
            <ul className="space-y-3 text-sm">
              {finalArticles.slice(1, 6).map((a) => (
  <li
    key={a.id}
    className="flex items-start gap-3 hover:bg-neutral-800 p-2 rounded transition-all"
  >
    <div className="text-red-500 mt-1">◆</div>
    <div>
      <Link
  to={`/article/${a.slug}`}
  className="leading-tight font-medium hover:underline"
>
  {a.title}
</Link>
      <div className="text-xs text-neutral-400">
        {formatAge(a)}
      </div>
    </div>
  </li>
))}

            </ul>
          </div>
        </aside>

        {/* CENTER */}
        <section className="md:col-span-6 space-y-6">
          <article className="bg-neutral-900 border border-neutral-800 rounded p-4 grid md:grid-cols-3 gap-4">
     <img
  src={featuredArticle?.hero_image || ""}
    className="rounded object-cover h-40"
    alt=""
  />

  <div className="md:col-span-2">
    <div className="text-red-500 text-sm">
      {featuredArticle?.category?.toUpperCase() || ""}
    </div>

    <Link
  to={`/article/${featuredArticle?.slug}`}
  className="font-serif text-2xl font-bold mt-2 block hover:underline"
>
  {featuredArticle?.title}
</Link>


    <p className="text-neutral-300 mt-2 text-sm">
      {featuredArticle?.paragraphs?.[0]?.slice(0, 120)}
    </p>
  </div>
</article>


          {/* ADS */}
          <div className="border border-neutral-800 rounded p-6 text-center text-neutral-400">
            Google Ad Space
          </div>

          {/* MORE */}
          <div>
            <h3 className="font-serif text-xl mb-4">More Stories</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {finalArticles.slice(2, 5).map((a) => (
  <div
    key={a.id}
    className="rounded overflow-hidden bg-neutral-900 border border-neutral-800 hover:scale-[1.01] transition-transform shadow-sm"
  >
    <div className="p-4">
      <div className="text-xs text-red-500 font-semibold">
        {a.category}
      </div>
      <Link
  to={`/article/${a.slug}`}
  className="font-bold mt-2 block hover:underline"
>
  {a.title}
</Link>

      <p className="text-sm text-neutral-400 mt-2">
        {a.paragraphs?.[0]?.slice(0, 90)}
      </p>
      <div className="mt-3">
        <span className="text-xs text-neutral-400">
          {formatAge(a)}
        </span>
      </div>
    </div>
  </div>
))}

            </div>
          </div>
        </section>

        {/* RIGHT */}
<aside className="md:col-span-3 space-y-6">

  {/* SHORTS */}
  <div className="bg-neutral-900 border border-neutral-800 p-4 rounded">
  <h3 className="font-serif text-xl mb-4 border-b border-neutral-700 pb-2">
    Shorts
  </h3>

  <div className="space-y-4">

    <a
      href="https://www.instagram.com/reel/DUllbZmEjM4/"
      target="_blank"
      className="block group"
    >
      <div className="relative h-48 bg-neutral-800 rounded overflow-hidden flex items-center justify-center">
        <span className="text-4xl">▶</span>

        <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-sm">
          Watch Reel
        </div>
      </div>
    </a>

    <a
      href="https://www.instagram.com/reel/DU6IJd1DaoR/"
      target="_blank"
      className="block group"
    >
      <div className="relative h-48 bg-neutral-800 rounded overflow-hidden flex items-center justify-center">
        <span className="text-4xl">▶</span>

        <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-sm">
          Watch Reel
        </div>
      </div>
    </a>

  </div>
</div>

  {/* E-PAPER */}
  <div className="bg-neutral-900 border border-neutral-800 p-4 rounded text-center">
    <img src={logoAsset} className="h-8 mx-auto mb-2" />
    <div className="text-sm text-neutral-400">Open E-Paper</div>
  </div>

  {/* SUBSCRIBE */}
  <div className="bg-neutral-900 border border-neutral-800 p-4 rounded">
    <h4 className="font-semibold mb-2">Subscribe</h4>
    <p className="text-sm text-neutral-400 mb-3">
      Get the day's top stories in your inbox.
    </p>

    <div className="flex flex-col gap-2">
      <input
        placeholder="Email"
        className="bg-black border border-neutral-700 px-3 py-2 rounded text-sm w-full"
      />
      <button className="bg-red-600 text-black py-2 rounded text-sm">
        Subscribe
      </button>
    </div>
  </div>
</aside>
</main>
      {/* ================= MODAL ================= */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-neutral-900 p-6 rounded border max-w-xl">
            <button
              onClick={() => setModal(null)}
              className="text-right w-full mb-2"
            >
              ✕
            </button>
            {modal.content}
          </div>
        </div>
      )}

      {/* ================= CSS ================= */}
      <style>{`
        .ticker {
          animation: tickerMove 18s linear infinite;
          white-space: nowrap;
        }
        @keyframes tickerMove {
          from { transform: translateX(100%); }
          to { transform: translateX(-100%); }
        }
        .hero-fade {
          animation: fade 1.2s ease forwards;
        }
        @keyframes fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
          /* ===== VERITAS EXPANDING SEARCH ===== */

.veritas-search {
  position: relative;
  width: 50px;
  height: 42px;
  background: #0b0b0b;
  border: 2px solid #1f1f1f;
  border-radius: 30px;
  padding: 5px;
  box-sizing: border-box;
  transition: all 0.6s ease;
}

.veritas-search input {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 100%;
  line-height: 30px;
  outline: none;
  border: none;
  background: transparent;
  color: white;
  font-size: 0.9rem;
  border-radius: 20px;
  padding: 0 20px;
  transition: width 0.6s ease;
}

.veritas-search .fa {
  box-sizing: border-box;
  padding: 10px;
  width: 38px;
  height: 38px;
  position: absolute;
  top: 0;
  right: 0;
  border-radius: 50%;
  color: #aaa;
  text-align: center;
  font-size: 1rem;
  transition: all 0.6s ease;
  cursor: pointer;
}

.veritas-search:hover,
.veritas-search:focus-within {
  width: 220px;
  border-color: #ff2b2b;
}

.veritas-search:hover input,
.veritas-search:focus-within input {
  width: 100%;
}

.veritas-search:hover .fa,
.veritas-search:focus-within .fa {
  background: #ff2b2b;
  color: black;
}

      `}</style>

    </div>
  );
}
