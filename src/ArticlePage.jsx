import React, { useEffect, useState } from "react";
import Script from "next/script";
import { Link, useParams } from "./lib/router";
import { fetchArticleBySlug, fetchArticles } from "./api";
import AdSlot from "./components/AdSlot";
import Seo from "./components/Seo";
import { AD_SLOT_ARTICLE_INLINE, AD_SLOT_ARTICLE_SIDEBAR } from "./lib/env";
import { getAuthorProfile } from "./content/authors";
import { getImagePresentation, getStoryImageUrl } from "./utils/cloudinary";
import { formatPublishedDateTime } from "./utils/time";

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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (initialArticle) setArticle(initialArticle);
    if (Array.isArray(initialLatest) && initialLatest.length > 0) setLatest(initialLatest);
    setError(initialError);
  }, [initialArticle, initialLatest, initialError]);

  useEffect(() => {
    if (!slug) return;

    const initialSlugMatches =
      initialArticle &&
      (initialArticle.slug === slug || initialArticle.raw_slug === slug);

    if (initialSlugMatches && initialLatest.length > 0) {
      return;
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
  }, [slug, initialArticle, initialLatest.length]);

  if (error) return <div className="p-6 text-white">{error}</div>;
  if (!article) return <div className="p-6 text-white">Loading...</div>;

  const authorProfile = getAuthorProfile(article.author_name || "The Veritas Desk");
  const articleDescription = article.subheadline?.trim() || `${article.title} on The Veritas.`;
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
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.theveritas.in/" },
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
    image: article.hero_image ? [getStoryImageUrl(article.hero_image)] : undefined,
    datePublished: article.published_at || undefined,
    dateModified: article.updated_at || article.published_at || undefined,
    articleSection: article.category || undefined,
    mainEntityOfPage: `https://www.theveritas.in/article/${article.slug}`,
    author: {
      "@type": "Person",
      name: article.author_name?.trim() || "The Veritas Desk",
      url: `https://www.theveritas.in/authors/${authorProfile.slug}`
    },
    publisher: {
      "@type": "Organization",
      name: "The Veritas",
      logo: { "@type": "ImageObject", url: "https://www.theveritas.in/LOGO.jpeg" }
    },
    isPartOf: {
      "@type": "Product",
      name: "The Veritas",
      productID: "CAow96zGDA:openaccess"
    },
    isAccessibleForFree: true
  };

  const renderedBlocks = (article.content_blocks || []).filter(Boolean);
  const paragraphIndexes = renderedBlocks.reduce((accumulator, block, index) => {
    if (block.type === "paragraph" || (!block.type && typeof block.text === "string")) {
      accumulator.push(index);
    }
    return accumulator;
  }, []);

  const adInsertionIndexes = new Set();
  if (paragraphIndexes.length > 3) {
    adInsertionIndexes.add(paragraphIndexes[0]);
    adInsertionIndexes.add(paragraphIndexes[2]);
  }

  return (
    <div className="mx-auto grid max-w-6xl w-full grid-cols-1 gap-6 overflow-x-hidden px-3 py-6 sm:gap-10 sm:px-4 sm:py-10 md:grid-cols-12">
      <Seo
        title={article.title}
        description={articleDescription}
        path={`/article/${article.slug}`}
        canonical={`https://www.theveritas.in/article/${article.slug}`}
        image={article.hero_image || undefined}
        type="article"
        structuredData={[breadcrumbSchema, articleSchema]}
        keywords={articleKeywords}
        tags={Array.isArray(article.hashtags) ? article.hashtags : []}
      />

      {isMounted && (
        <Script
          src="https://news.google.com/swg/js/v1/swg-basic.js"
          strategy="lazyOnload"
          onLoad={() => {
            if (!window.SWG_BASIC) return;
            window.SWG_BASIC.push((basicSubscriptions) => {
              if (!basicSubscriptions) return;
              basicSubscriptions.init({
                type: "NewsArticle",
                isPartOfType: ["Product"],
                isPartOfProductId: "CAow96zGDA:openaccess",
                clientOptions: { theme: "light", lang: "en" }
              });
            });
          }}
        />
      )}

      <div className="min-w-0 md:col-span-8">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="text-sm uppercase tracking-wide" style={{ color: "var(--veritas-red)" }}>
            {article.category}
          </div>
          {article.is_editorial && <EditorialBadge />}
        </div>

        <h1 className="break-words font-serif text-[2.3rem] font-bold leading-[1.02] tracking-tight sm:text-5xl md:text-[3.2rem] lg:text-[3.75rem] xl:text-[4.1rem]">
          {article.title}
        </h1>
        <p className="mt-3 text-base italic leading-relaxed text-neutral-400 sm:text-lg">
          {article.subheadline}
        </p>
        <div className="my-4 w-16 border-b" style={{ borderColor: "var(--veritas-red)" }} />
        <div className="mt-3 text-sm text-neutral-500">
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
          className="my-6 max-h-[520px] w-full rounded-2xl object-cover shadow-lg sm:my-8"
          style={getImagePresentation(article.hero_focus, article.hero_crop)}
          alt={article.hero_caption || article.title}
          loading="eager"
        />
        {article.hero_caption ? (
          <div className="-mt-2 mb-6 text-sm leading-6 text-neutral-400 sm:mb-8">{article.hero_caption}</div>
        ) : null}

        <div className="space-y-5 break-words font-serif text-[17px] leading-[1.9] text-white sm:space-y-6 sm:text-[18px]">
          {renderedBlocks.map((block, index) => {
            const text = typeof block.text === "string" ? block.text : "";

            if (block.type === "subheading") {
              return (
                <h2 key={index} className="mb-3 mt-8 text-2xl font-bold text-white">
                  {text}
                </h2>
              );
            }

            if (block.type === "image" && text) {
              return (
                <figure key={index} className="my-8 space-y-3">
                  <img
                    src={getStoryImageUrl(text)}
                    alt={block.caption || ""}
                    className="max-h-[560px] w-full rounded-2xl object-cover shadow-lg"
                    loading="lazy"
                  />
                  {block.caption && (
                    <figcaption className="text-sm text-neutral-400">{block.caption}</figcaption>
                  )}
                </figure>
              );
            }

            if (block.type === "video" && text) {
              return (
                <figure key={index} className="my-8 space-y-3">
                  <video
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full rounded-2xl bg-black shadow-lg"
                  >
                    <source src={text} />
                    Your browser does not support embedded video playback.
                  </video>
                  {block.caption ? (
                    <figcaption className="text-sm text-neutral-400">{block.caption}</figcaption>
                  ) : null}
                </figure>
              );
            }

            if (block.type === "source" && (text || block.href)) {
              const href = typeof block.href === "string" ? block.href.trim() : "";
              const label = text || href;
              return (
                <div key={index} className="my-6 rounded-2xl border border-white/15 bg-neutral-950/90 p-4">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-[var(--veritas-red)]">Source</div>
                  <div className="mt-2 text-sm leading-7 text-neutral-200">
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="underline decoration-white/30 underline-offset-4 transition hover:text-white"
                      >
                        {label}
                      </a>
                    ) : (
                      label
                    )}
                  </div>
                </div>
              );
            }

            if (block.type === "table") {
              const headers = Array.isArray(block.headers) ? block.headers : [];
              const rows = Array.isArray(block.rows) ? block.rows : [];
              return (
                <div key={index} className="my-8 overflow-x-auto rounded-2xl border border-white/15 bg-black">
                  {block.title ? (
                    <div className="border-b border-white/15 px-4 py-3 font-semibold text-white">{block.title}</div>
                  ) : null}
                  <table className="w-full border-collapse text-sm text-white">
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
                          {(Array.isArray(row) ? row : []).map((cell, cellIndex) => (
                            <td key={cellIndex} className="border border-white px-4 py-3 align-top text-white">
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
              <React.Fragment key={index}>
                <p
                  className={
                    index === 0
                      ? "first-letter:float-left first-letter:mr-2 first-letter:text-5xl first-letter:font-bold"
                      : ""
                  }
                >
                  {text}
                </p>
                {adInsertionIndexes.has(index) && (
                  <AdSlot slot={AD_SLOT_ARTICLE_INLINE} label="Advertisement" className="my-2 min-h-[180px]" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {article.bibliography ? (
          <section className="mt-10 rounded-2xl border border-white/15 bg-neutral-950/80 p-5 sm:p-6">
            <div className="text-xs uppercase tracking-[0.24em] text-[var(--veritas-red)]">Bibliography</div>
            <div className="mt-3 whitespace-pre-line text-sm leading-8 text-neutral-300">
              {article.bibliography}
            </div>
          </section>
        ) : null}
      </div>

      <div className="h-fit min-w-0 space-y-5 sm:space-y-6 md:sticky md:top-24 md:col-span-4">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:p-5">
          <h3 className="mb-4 border-b border-neutral-700 pb-2 font-serif text-2xl">Latest News</h3>
          <ul className="space-y-4 text-sm">
            {latest.map((item) => (
              <li key={item.id} className="flex gap-3">
                <div className="mt-1 shrink-0" style={{ color: "var(--veritas-red)" }}>
                  ◆
                </div>
                <Link
                  to={`/article/${item.slug}`}
                  className="break-words transition-all hover:text-white hover:underline"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <AdSlot slot={AD_SLOT_ARTICLE_SIDEBAR} label="Advertisement" className="min-h-[250px]" />
      </div>
    </div>
  );
}
