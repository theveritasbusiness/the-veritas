import React, { useEffect, useState } from "react";
import { Link, useParams } from "./lib/router";
import { fetchArticleBySlug, fetchArticles } from "./api";
import AdSlot from "./components/AdSlot";
import Seo from "./components/Seo";
import { AD_SLOT_ARTICLE_INLINE, AD_SLOT_ARTICLE_SIDEBAR } from "./lib/env";
import { getAuthorProfile } from "./content/authors";
import { getImageObjectPosition, getStoryImageUrl } from "./utils/cloudinary";
import { formatPublishedDateTime, getArticleDisplayTime } from "./utils/time";

function EditorialBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--veritas-red)" }} />
      Editorial
    </span>
  );
}

export default function ArticlePage({
  initialArticle = null,
  initialLatest = [],
  initialError = ""
}) {
  const { slug } = useParams();
  const [article, setArticle] = useState(initialArticle);
  const [latest, setLatest] = useState(initialLatest);
  const [error, setError] = useState(initialError);

  useEffect(() => {
    if (!slug) {
      return undefined;
    }

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
    return undefined;
  }, [slug]);

  if (error) {
    return <div className="text-white p-6">{error}</div>;
  }

  if (!article) {
    return <div className="text-white p-6">Loading...</div>;
  }

  const articleDescription =
    article.paragraphs?.find((paragraph) => typeof paragraph === "string" && paragraph.trim())?.slice(0, 155) ||
    article.subheadline?.trim() ||
    `${article.title} on The Veritas.`;
  const articleKeywords = [
    article.category,
    ...(Array.isArray(article.hashtags) ? article.hashtags : [])
  ]
    .filter(Boolean)
    .map((item) => String(item).trim())
    .filter(Boolean);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.theveritas.in/"
      },
      article.category
        ? {
            "@type": "ListItem",
            position: 2,
            name: article.category,
            item: `https://www.theveritas.in/?category=${encodeURIComponent(article.category)}`
          }
        : null,
      {
        "@type": "ListItem",
        position: article.category ? 3 : 2,
        name: article.title,
        item: `https://www.theveritas.in/article/${article.slug}`
      }
    ].filter(Boolean)
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: articleDescription,
    image: article.hero_image ? [article.hero_image] : undefined,
    datePublished: article.published_at || undefined,
    dateModified: article.updated_at || article.published_at || undefined,
    articleSection: article.category || undefined,
    mainEntityOfPage: `https://www.theveritas.in/article/${article.slug}`,
    author: {
      "@type": "Person",
      name: article.author_name?.trim() || "The Veritas Desk"
    },
    publisher: {
      "@type": "Organization",
      name: "The Veritas",
      logo: {
        "@type": "ImageObject",
        url: "https://www.theveritas.in/LOGO.jpeg"
      }
    }
  };

  const renderedBlocks = (article.content_blocks || []).filter(Boolean);
  const authorProfile = getAuthorProfile(article.author_name || "The Veritas Desk");
  const paragraphIndexes = renderedBlocks.reduce((acc, block, index) => {
    if (
      block.type !== "subheading" &&
      !((block.type === "image" || block.type === "video") && !block.text)
    ) {
      const text =
        typeof block.text === "string"
          ? block.text
          : JSON.stringify(block.text || "");

      if (block.type === "paragraph" || (!block.type && text)) {
        acc.push(index);
      }
    }
    return acc;
  }, []);

  const adInsertionIndexes = new Set();
  if (paragraphIndexes.length > 1) {
    const firstInsertion = paragraphIndexes[0];
    const lastParagraphIndex = paragraphIndexes[paragraphIndexes.length - 1];

    if (firstInsertion !== lastParagraphIndex) {
      adInsertionIndexes.add(firstInsertion);
    }

    for (let paragraphNumber = 3; paragraphNumber < paragraphIndexes.length; paragraphNumber += 2) {
      const blockIndex = paragraphIndexes[paragraphNumber - 1];
      if (blockIndex !== lastParagraphIndex) {
        adInsertionIndexes.add(blockIndex);
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto w-full px-3 sm:px-4 py-6 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-10 overflow-x-hidden">
      <Seo
        title={article.title}
        description={articleDescription}
        path={`/article/${article.slug}`}
        image={article.hero_image || undefined}
        type="article"
        structuredData={[breadcrumbSchema, articleSchema]}
        keywords={articleKeywords}
        tags={Array.isArray(article.hashtags) ? article.hashtags : []}
      />
      <div className="md:col-span-8 min-w-0">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="text-sm uppercase tracking-wide" style={{ color: "var(--veritas-red)" }}>
            {article.category}
          </div>
          {article.is_editorial ? <EditorialBadge /> : null}
        </div>

        <h1 className="text-[2.3rem] sm:text-5xl md:text-[3.9rem] lg:text-[4.5rem] xl:text-[5rem] font-serif font-bold leading-[1.02] tracking-tight break-words">
          {article.title}
        </h1>

        <p className="text-neutral-400 italic mt-3 text-base sm:text-lg leading-relaxed">
          {article.subheadline}
        </p>

        <div className="border-b w-16 my-4" style={{ borderColor: "var(--veritas-red)" }}></div>
        <div className="text-sm text-neutral-500 mt-3">
          By{" "}
          <Link
            to={`/authors/${authorProfile.slug}`}
            className="text-white transition hover:text-[var(--veritas-red)]"
          >
            {article.author_name?.trim() || "The Veritas Desk"}
          </Link>{" "}
          | {formatPublishedDateTime(article.published_at)}
        </div>

        <img
          src={getStoryImageUrl(article.hero_image)}
          className="my-6 sm:my-8 rounded-2xl w-full object-cover shadow-lg max-h-[520px]"
          style={{ objectPosition: getImageObjectPosition(article.hero_focus) }}
          alt={article.hero_caption || article.title}
          loading="eager"
          decoding="async"
        />

        {article.hero_caption && (
          <p className="text-sm text-neutral-500 mb-6">{article.hero_caption}</p>
        )}

        <div className="border-t my-6" style={{ borderColor: "var(--veritas-red)" }}></div>

        <div className="space-y-5 sm:space-y-6 text-[17px] sm:text-[18px] leading-[1.9] text-white font-serif break-words">
          {renderedBlocks.map((block, i) => {
            if (!block) return null;

            const text =
              typeof block.text === "string"
                ? block.text
                : JSON.stringify(block.text || "");

            if (block.type === "subheading") {
              return (
                <h2 key={i} className="text-2xl font-bold mt-8 mb-3 text-white">
                  {text}
                </h2>
              );
            }

            if (block.type === "image" && text) {
              return (
                <figure key={i} className="my-8 space-y-3">
                  <img
                    src={getStoryImageUrl(text)}
                    alt={block.caption || `${article.title} inline visual ${i + 1}`}
                    className="w-full rounded-2xl object-cover shadow-lg max-h-[560px]"
                    style={{ objectPosition: getImageObjectPosition(article.hero_focus) }}
                    loading="lazy"
                    decoding="async"
                  />
                  {block.caption && (
                    <figcaption className="text-sm text-neutral-400 leading-relaxed">
                      {block.caption}
                    </figcaption>
                  )}
                </figure>
              );
            }

            if (block.type === "video" && text) {
              return (
                <figure key={i} className="my-8 space-y-3">
                  <video
                    src={text}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full rounded-2xl bg-black shadow-lg max-h-[560px]"
                  />
                  {block.caption && (
                    <figcaption className="text-sm text-neutral-400 leading-relaxed">
                      {block.caption}
                    </figcaption>
                  )}
                </figure>
              );
            }

            if (block.type === "table") {
              const headers = Array.isArray(block.headers) ? block.headers : [];
              const rows = Array.isArray(block.rows) ? block.rows : [];

              if (headers.length === 0 && rows.length === 0) {
                return null;
              }

              return (
                <div key={i} className="my-8 overflow-x-auto">
                  {block.title ? (
                    <div className="mb-3 text-lg font-semibold text-white">{block.title}</div>
                  ) : null}
                  <table className="w-full min-w-[520px] border-collapse border border-white text-sm sm:text-base">
                    {headers.length > 0 ? (
                      <thead>
                        <tr>
                          {headers.map((header, headerIndex) => (
                            <th
                              key={headerIndex}
                              className="border border-white px-4 py-3 text-left font-semibold text-white"
                              style={{ backgroundColor: "var(--veritas-red)" }}
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                    ) : null}
                    <tbody>
                      {rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="border border-white px-4 py-3 align-top text-white"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }

            if (!text) return null;

            return (
              <React.Fragment key={i}>
                <p
                  className={
                    i === 0
                      ? "first-letter:text-5xl first-letter:font-bold first-letter:mr-2 first-letter:float-left"
                      : ""
                  }
                >
                  {text}
                </p>

                {adInsertionIndexes.has(i) ? (
                  <AdSlot
                    slot={AD_SLOT_ARTICLE_INLINE}
                    label="Advertisement"
                    className="my-2 min-h-[180px]"
                  />
                ) : null}
              </React.Fragment>
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

        <AdSlot
          slot={AD_SLOT_ARTICLE_SIDEBAR}
          label="Advertisement"
          className="min-h-[250px]"
        />

        <div className="flex flex-wrap gap-3 text-neutral-400">
          <span>Link</span>
          <span>News</span>
          <span>Discuss</span>
        </div>
      </div>
    </div>
  );
}
