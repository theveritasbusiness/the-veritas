import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchArticleBySlug, fetchArticles } from "./api";

export default function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [latest, setLatest] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPage() {
      try {
        const [articleData, latestArticles] = await Promise.all([
          fetchArticleBySlug(slug),
          fetchArticles()
        ]);

        setArticle(articleData);
        setLatest(latestArticles.slice(0, 5));
        setError("");
      } catch (err) {
        setArticle(null);
        setError(err.message);
      }
    }

    loadPage();
  }, [slug]);

  if (error) {
    return <div className="text-white p-6">{error}</div>;
  }

  if (!article) {
    return <div className="text-white p-6">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto w-full px-3 sm:px-4 py-6 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-10 overflow-x-hidden">
      <div className="md:col-span-8 min-w-0">
        <div className="text-sm uppercase tracking-wide mb-2" style={{ color: "var(--veritas-red)" }}>
          {article.category}
        </div>

        <h1 className="text-[2.3rem] sm:text-5xl md:text-7xl font-serif font-bold leading-[1.02] tracking-tight break-words">
          {article.title}
        </h1>

        <p className="text-neutral-400 italic mt-3 text-base sm:text-lg leading-relaxed">
          {article.subheadline}
        </p>

        <div className="border-b w-16 my-4" style={{ borderColor: "var(--veritas-red)" }}></div>
        <div className="text-sm text-neutral-500 mt-3">
          By The Veritas Desk |{" "}
          {article.published_ago
            ? `${article.published_ago.hours || 0}h ${article.published_ago.minutes || 0}m ago`
            : "Recently"}
        </div>

        <img
          src={article.hero_image}
          className="my-6 sm:my-8 rounded-2xl w-full object-cover shadow-lg max-h-[520px]"
          alt={article.hero_caption || article.title}
        />

        {article.hero_caption && (
          <p className="text-sm text-neutral-500 mb-6">{article.hero_caption}</p>
        )}

        <div className="border-t my-6" style={{ borderColor: "var(--veritas-red)" }}></div>

        <div className="space-y-5 sm:space-y-6 text-[17px] sm:text-[18px] leading-[1.9] text-white font-serif break-words">
          {(article.content_blocks || []).map((block, i) => {
            if (!block) return null;

            const text =
              typeof block.text === "string"
                ? block.text
                : JSON.stringify(block.text || "");

            if (!text) return null;

            if (block.type === "subheading") {
              return (
                <h2 key={i} className="text-2xl font-bold mt-8 mb-3 text-white">
                  {text}
                </h2>
              );
            }

            return (
              <p
                key={i}
                className={
                  i === 0
                    ? "first-letter:text-5xl first-letter:font-bold first-letter:mr-2 first-letter:float-left"
                    : ""
                }
              >
                {text}
              </p>
            );
          })}
        </div>

        {article.bibliography && (
          <div className="text-sm text-neutral-500 mt-10 border-t border-neutral-800 pt-4">
            {article.bibliography}
          </div>
        )}
      </div>

      <div className="md:col-span-4 space-y-5 sm:space-y-6 md:sticky md:top-24 h-fit min-w-0">
        <div className="bg-neutral-900 border border-neutral-800 p-4 sm:p-5 rounded-2xl">
          <h3 className="font-serif text-2xl mb-4 border-b border-neutral-700 pb-2">
            Latest News
          </h3>

          <ul className="space-y-4 text-sm">
            {latest.map((item) => (
              <li key={item.id} className="flex gap-3">
                <div className="mt-1 shrink-0" style={{ color: "var(--veritas-red)" }}>
                  ◆
                </div>
                <Link
                  to={`/article/${item.slug}`}
                  className="hover:underline transition-all duration-200 hover:text-white break-words"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 sm:p-5 rounded-2xl">
          <h3 className="font-serif text-xl mb-4 border-b border-neutral-700 pb-2">
            Related
          </h3>

          <div className="space-y-3">
            {latest
              .filter((item) => item.slug !== slug)
              .slice(0, 3)
              .map((item) => (
                <Link key={item.id} to={`/article/${item.slug}`} className="block hover:underline break-words">
                  {item.title}
                </Link>
              ))}
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-6 text-center text-neutral-400 rounded-2xl">
          Advertisement
        </div>

        <div className="flex flex-wrap gap-3 text-neutral-400">
          <span>Link</span>
          <span>News</span>
          <span>Discuss</span>
        </div>
      </div>
    </div>
  );
}
