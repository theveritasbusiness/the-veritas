import React from "react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "./components/Layout";

export default function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [latest, setLatest] = useState([]);

  useEffect(() => {
    fetch(`https://veritas-backend-dktb.onrender.com/articles/${slug}`)
      .then(res => res.json())
      .then(setArticle);

    fetch(`https://veritas-backend-dktb.onrender.com/articles`)
      .then(res => res.json())
      .then(data => setLatest(data.slice(0, 5)));
  }, [slug]);

  if (!article) return <div className="text-white p-6">Loading...</div>;

return (
  <Layout>
    <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-12 gap-10">

      {/* ================= LEFT: ARTICLE ================= */}
      <div className="md:col-span-8">

        <div className="text-red-500 text-sm uppercase tracking-wide mb-2">
          {article.category}
        </div>

        {/* HEADLINE */}
        <h1 className="text-4xl md:text-7xl font-serif font-bold leading-[1.1] tracking-tight">
          {article.title}
        </h1>

        {/* SUBHEADLINE */}
        <p className="text-neutral-400 italic mt-3 text-lg">
          {article.subheadline}
        </p>

        <div className="border-b border-red-500 w-16 my-4"></div>
        <div className="text-sm text-neutral-500 mt-3">
  By The Veritas Desk • {article.published_ago || "Recently"}
</div>

        {/* HERO IMAGE */}
        <img
          src={article.hero_image}
          className="my-8 rounded-xl w-full object-cover shadow-lg"
        />

        {/* CAPTION */}
        {article.hero_caption && (
          <p className="text-sm text-neutral-500 mb-6">
            {article.hero_caption}
          </p>
        )}

        {/* RED DIVIDER */}
        <div className="border-t border-red-600 my-6"></div>

        {/* CONTENT */}
        <div className="space-y-6 text-[18px] leading-[1.9] text-neutral-300 font-serif">
          {(article.content_blocks || []).map((block, i) => {
  if (block.type === "subheading") {
    return (
      <h2
        key={i}
        className="text-2xl font-bold mt-8 mb-3 text-white"
      >
        {block.text}
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
      {block.text}
    </p>
  );
})}
        </div>

        {/* BIBLIOGRAPHY */}
        {article.bibliography && (
          <div className="text-sm text-neutral-500 mt-10 border-t border-neutral-800 pt-4">
            {article.bibliography}
          </div>
        )}

      </div>

      {/* ================= RIGHT: SIDEBAR ================= */}
      <div className="md:col-span-4 space-y-6 md:sticky md:top-24 h-fit">

        {/* LATEST NEWS */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded">
          <h3 className="font-serif text-2xl mb-4 border-b border-neutral-700 pb-2">
            Latest News
          </h3>

          <ul className="space-y-4 text-sm">
            {latest.map(item => (
              <li key={item.id} className="flex gap-3">
                <div className="text-red-500 mt-1">◆</div>
                <a href={`/article/${item.slug}`} className="hover:underline transition-all duration-200 hover:text-white">
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded">
  <h3 className="font-serif text-xl mb-4 border-b border-neutral-700 pb-2">
    Related
  </h3>

  <div className="space-y-3">
    {latest.slice(0, 3).map(item => (
      <a
        key={item.id}
        href={`/article/${item.slug}`}
        className="block hover:underline text-sm"
      >
        {item.title}
      </a>
    ))}
  </div>
</div>

        {/* AD */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 text-center text-neutral-400 rounded">
          Advertisement
        </div>

        {/* SOCIAL */}
        <div className="flex gap-4 text-neutral-400">
          <span>🔗</span>
          <span>📰</span>
          <span>💬</span>
        </div>

      </div>

    </div>
  </Layout>
);
}