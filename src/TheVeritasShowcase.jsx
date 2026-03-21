import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchArticles, fetchBreaking } from "./api";
import logoAsset from "./assets/Logo_Edit_4.png";

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
  const [articles, setArticles] = useState([]);
  const [breaking, setBreaking] = useState([]);
  const [searchParams] = useSearchParams();

  const searchQuery = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category");

  const searchedArticles = articles.filter((article) => {
    const query = searchQuery.toLowerCase();
    return (
      article.title?.toLowerCase().includes(query) ||
      article.category?.toLowerCase().includes(query) ||
      article.paragraphs?.some(
        (paragraph) => typeof paragraph === "string" && paragraph.toLowerCase().includes(query)
      )
    );
  });

  const finalArticles = searchedArticles.filter((article) => {
    if (!selectedCategory || selectedCategory === "Home") return true;

    return (
      article.category &&
      article.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  });

  const sliderArticles = finalArticles.filter((article) => article.show_on_slider === true);
  const heroArticle = sliderArticles[0] || finalArticles[0] || null;
  const featuredArticle = finalArticles.length > 1 ? finalArticles[1] : null;

  useEffect(() => {
    async function loadData() {
      try {
        const [allArticles, breakingArticles] = await Promise.all([
          fetchArticles(),
          fetchBreaking()
        ]);

        setArticles(allArticles);
        setBreaking(breakingArticles);
      } catch (err) {
        console.error("Failed to load articles:", err);
      }
    }

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white antialiased font-sans">
      {breaking.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 mt-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded px-3 py-2 flex gap-4">
            <div className="text-red-500 font-bold text-sm">BREAKING</div>
            <div className="overflow-hidden whitespace-nowrap flex-1">
              <div className="ticker">{breaking.map((item) => item.title).join(" | ")}</div>
            </div>
          </div>
        </div>
      )}

      {heroArticle && (
        <header className="max-w-6xl mx-auto px-4 mt-6">
          <Link to={`/article/${heroArticle.slug}`}>
            <div className="relative h-64 md:h-96 rounded overflow-hidden cursor-pointer">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${heroArticle.hero_image || "https://via.placeholder.com/1200x600"})`
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex items-end">
                <div>
                  <div className="text-red-500 font-semibold">
                    {heroArticle.is_breaking ? "BREAKING" : "TOP STORY"}
                  </div>

                  <h1 className="text-3xl md:text-5xl font-serif font-bold">
                    {heroArticle.title || "Loading..."}
                  </h1>

                  <p className="text-neutral-300 mt-2 max-w-2xl">
                    {heroArticle.paragraphs?.[0]?.slice(0, 140)}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </header>
      )}

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-12 gap-6">
        {finalArticles.length === 0 && (
          <div className="col-span-12 text-center text-neutral-400 py-20">
            No articles found.
          </div>
        )}

        <aside className="md:col-span-3">
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded">
            <h3 className="font-serif text-2xl mb-3 border-b pb-2">Latest News</h3>
            <ul className="space-y-3 text-sm">
              {finalArticles.slice(1, 6).map((article) => (
                <li
                  key={article.id}
                  className="flex items-start gap-3 hover:bg-neutral-800 p-2 rounded transition-all"
                >
                  <div className="text-red-500 mt-1">◆</div>
                  <div>
                    <Link
                      to={`/article/${article.slug}`}
                      className="leading-tight font-medium hover:underline"
                    >
                      {article.title}
                    </Link>
                    <div className="text-xs text-neutral-400">{formatAge(article)}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="md:col-span-6 space-y-6">
          {featuredArticle && (
            <article className="bg-neutral-900 border border-neutral-800 rounded p-4 grid md:grid-cols-3 gap-4">
              <img
                src={featuredArticle.hero_image || ""}
                className="rounded object-cover h-40"
                alt={featuredArticle.title}
              />

              <div className="md:col-span-2">
                <div className="text-red-500 text-sm">
                  {featuredArticle.category?.toUpperCase() || ""}
                </div>

                <Link
                  to={`/article/${featuredArticle.slug}`}
                  className="font-serif text-2xl font-bold mt-2 block hover:underline"
                >
                  {featuredArticle.title}
                </Link>

                <p className="text-neutral-300 mt-2 text-sm">
                  {featuredArticle.paragraphs?.[0]?.slice(0, 120)}
                </p>
              </div>
            </article>
          )}

          <div className="border border-neutral-800 rounded p-6 text-center text-neutral-400">
            Google Ad Space
          </div>

          <div>
            <h3 className="font-serif text-xl mb-4">More Stories</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {finalArticles.slice(2, 5).map((article) => (
                <div
                  key={article.id}
                  className="rounded overflow-hidden bg-neutral-900 border border-neutral-800 hover:scale-[1.01] transition-transform shadow-sm"
                >
                  <div className="p-4">
                    <div className="text-xs text-red-500 font-semibold">{article.category}</div>
                    <Link
                      to={`/article/${article.slug}`}
                      className="font-bold mt-2 block hover:underline"
                    >
                      {article.title}
                    </Link>

                    <p className="text-sm text-neutral-400 mt-2">
                      {article.paragraphs?.[0]?.slice(0, 90)}
                    </p>
                    <div className="mt-3">
                      <span className="text-xs text-neutral-400">{formatAge(article)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="md:col-span-3 space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded">
            <h3 className="font-serif text-xl mb-4 border-b border-neutral-700 pb-2">
              Shorts
            </h3>

            <div className="space-y-4">
              <a
                href="https://www.instagram.com/reel/DUllbZmEjM4/"
                target="_blank"
                rel="noreferrer"
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
                rel="noreferrer"
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

          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded text-center">
            <img src={logoAsset} className="h-8 mx-auto mb-2" alt="The Veritas logo" />
            <div className="text-sm text-neutral-400">Open E-Paper</div>
          </div>

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

      <style>{`
        .ticker {
          animation: tickerMove 18s linear infinite;
          white-space: nowrap;
        }
        @keyframes tickerMove {
          from { transform: translateX(100%); }
          to { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
