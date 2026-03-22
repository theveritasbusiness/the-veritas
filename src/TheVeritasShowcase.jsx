import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchArticles, fetchBreaking } from "./api";

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
    <div className="min-h-screen bg-black text-white antialiased font-sans overflow-x-hidden">
      {breaking.length > 0 && (
        <div className="max-w-6xl mx-auto px-3 sm:px-4 mt-4 sm:mt-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="font-bold text-sm shrink-0" style={{ color: "var(--veritas-red)" }}>
              BREAKING
            </div>
            <div className="overflow-hidden whitespace-nowrap flex-1 text-sm sm:text-base">
              <div className="ticker">{breaking.map((item) => item.title).join(" | ")}</div>
            </div>
          </div>
        </div>
      )}

      {heroArticle && (
        <header className="max-w-6xl mx-auto px-3 sm:px-4 mt-4 sm:mt-6">
          <Link to={`/article/${heroArticle.slug}`}>
            <div className="relative min-h-[430px] sm:min-h-[470px] md:h-96 rounded-2xl overflow-hidden cursor-pointer">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${heroArticle.hero_image || "https://via.placeholder.com/1200x600"})`
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent p-5 sm:p-6 flex items-end">
                <div className="max-w-3xl">
                  <div
                    className="font-semibold text-sm sm:text-base"
                    style={{ color: "var(--veritas-red)" }}
                  >
                    {heroArticle.is_breaking ? "BREAKING" : "TOP STORY"}
                  </div>

                  <h1 className="text-4xl sm:text-5xl md:text-5xl font-serif font-bold leading-[0.98] mt-2 break-words">
                    {heroArticle.title || "Loading..."}
                  </h1>

                  <p className="text-neutral-300 mt-3 max-w-2xl text-base sm:text-lg leading-relaxed">
                    {heroArticle.paragraphs?.[0]?.slice(0, 140)}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </header>
      )}

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
        {finalArticles.length === 0 && (
          <div className="col-span-12 text-center text-neutral-400 py-20">
            No articles found.
          </div>
        )}

        <section className="order-2 md:order-1 md:col-span-3 min-w-0">
          <div className="bg-neutral-900 border border-neutral-800 p-4 sm:p-5 rounded-2xl">
            <h3 className="font-serif text-[2rem] sm:text-2xl mb-3 border-b pb-3">Latest News</h3>
            <ul className="space-y-3 text-sm">
              {finalArticles.slice(1, 6).map((article) => (
                <li
                  key={article.id}
                  className="flex items-start gap-3 hover:bg-neutral-800 p-2 rounded-xl transition-all"
                >
                  <div className="mt-1 shrink-0" style={{ color: "var(--veritas-red)" }}>
                    ◆
                  </div>
                  <div className="min-w-0">
                    <Link
                      to={`/article/${article.slug}`}
                      className="leading-tight font-medium hover:underline block break-words"
                    >
                      {article.title}
                    </Link>
                    <div className="text-xs text-neutral-400">{formatAge(article)}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="order-1 md:order-2 md:col-span-6 space-y-5 sm:space-y-6 min-w-0">
          {featuredArticle && (
            <article className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-[140px,1fr] md:grid-cols-3 gap-4">
              <img
                src={featuredArticle.hero_image || ""}
                className="rounded-xl object-cover h-44 sm:h-full w-full"
                alt={featuredArticle.title}
              />

              <div className="md:col-span-2 min-w-0">
                <div className="text-sm" style={{ color: "var(--veritas-red)" }}>
                  {featuredArticle.category?.toUpperCase() || ""}
                </div>

                <Link
                  to={`/article/${featuredArticle.slug}`}
                  className="font-serif text-2xl sm:text-[2rem] font-bold mt-2 block hover:underline break-words"
                >
                  {featuredArticle.title}
                </Link>

                <p className="text-neutral-300 mt-2 text-sm">
                  {featuredArticle.paragraphs?.[0]?.slice(0, 120)}
                </p>
              </div>
            </article>
          )}

          <div className="border border-neutral-800 rounded-2xl p-6 text-center text-neutral-400">
            Google Ad Space
          </div>

          <div>
            <h3 className="font-serif text-xl mb-4">More Stories</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {finalArticles.slice(2, 5).map((article) => (
                <div
                  key={article.id}
                  className="rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:scale-[1.01] transition-transform shadow-sm min-w-0"
                >
                  <div className="p-4">
                    <div className="text-xs font-semibold" style={{ color: "var(--veritas-red)" }}>
                      {article.category}
                    </div>
                    <Link
                      to={`/article/${article.slug}`}
                      className="font-bold mt-2 block hover:underline break-words"
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

        <aside className="order-3 md:col-span-3 space-y-5 sm:space-y-6 min-w-0">
          <div className="bg-neutral-900 border border-neutral-800 p-4 sm:p-5 rounded-2xl">
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
                <div className="relative h-44 sm:h-48 bg-neutral-800 rounded-xl overflow-hidden flex items-center justify-center">
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
                <div className="relative h-44 sm:h-48 bg-neutral-800 rounded-xl overflow-hidden flex items-center justify-center">
                  <span className="text-4xl">▶</span>

                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-sm">
                    Watch Reel
                  </div>
                </div>
              </a>
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
