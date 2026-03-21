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
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-10 grid md:grid-cols-12 gap-10">
      <div className="md:col-span-8">
        <div className="text-red-500 text-sm uppercase tracking-wide mb-2">
          {article.category}
        </div>

        <h1 className="text-4xl md:text-7xl font-serif font-bold leading-[1.1] tracking-tight">
          {article.title}
        </h1>

        <p className="text-neutral-400 italic mt-3 text-lg">
          {article.subheadline}
        </p>

        <div className="border-b border-red-500 w-16 my-4"></div>
        <div className="text-sm text-neutral-500 mt-3">
          By The Veritas Desk |
          {" "}
          {article.published_ago
            ? `${article.published_ago.hours || 0}h ${article.published_ago.minutes || 0}m ago`
            : "Recently"}
        </div>

        <img
          src={article.hero_image}
          className="my-8 rounded-xl w-full object-cover shadow-lg"
          alt={article.hero_caption || article.title}
        />

        {article.hero_caption && (
          <p className="text-sm text-neutral-500 mb-6">{article.hero_caption}</p>
        )}

        <div className="border-t border-red-600 my-6"></div>

        <div className="space-y-6 text-[18px] leading-[1.9] text-white font-serif">
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

      <div className="md:col-span-4 space-y-6 md:sticky md:top-24 h-fit">
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded">
          <h3 className="font-serif text-2xl mb-4 border-b border-neutral-700 pb-2">
            Latest News
          </h3>

          <ul className="space-y-4 text-sm">
            {latest.map((item) => (
              <li key={item.id} className="flex gap-3">
                <div className="text-red-500 mt-1">◆</div>
                <Link
                  to={`/article/${item.slug}`}
                  className="hover:underline transition-all duration-200 hover:text-white"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded">
          <h3 className="font-serif text-xl mb-4 border-b border-neutral-700 pb-2">
            Related
          </h3>

          <div className="space-y-3">
            {latest
              .filter((item) => item.slug !== slug)
              .slice(0, 3)
              .map((item) => (
                <Link key={item.id} to={`/article/${item.slug}`} className="block hover:underline">
                  {item.title}
                </Link>
              ))}
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-6 text-center text-neutral-400 rounded">
          Advertisement
        </div>

        <div className="flex gap-4 text-neutral-400">
          <span>Link</span>
          <span>News</span>
          <span>Discuss</span>
        </div>
      </div>
    </div>
  );
}
