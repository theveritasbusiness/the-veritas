import React, { useEffect, useState } from "react";
import { Link, useParams } from "./lib/router";
import { fetchArticleBySlug, fetchArticles } from "./api";
import AdSlot from "./components/AdSlot";
import Seo from "./components/Seo";
import { AD_SLOT_ARTICLE_INLINE, AD_SLOT_ARTICLE_SIDEBAR } from "./lib/env";
import { getAuthorProfile } from "./content/authors";
import { getImageObjectPosition, getStoryImageUrl } from "./utils/cloudinary";
import { formatPublishedDateTime } from "./utils/time";
import Script from "next/script";

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
    if (!slug) return;

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

  if (error) return <div className="text-white p-6">{error}</div>;
  if (!article) return <div className="text-white p-6">Loading...</div>;

  const authorProfile = getAuthorProfile(article.author_name || "The Veritas Desk");
  const articleDescription = article.subheadline?.trim() || `${article.title} on The Veritas.`;
  
  const articleKeywords = [
    article.category,
    ...(Array.isArray(article.hashtags) ? article.hashtags : [])
  ].filter(Boolean).map(item => String(item).trim()).filter(Boolean);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.theveritas.in/" },
      article.category ? { "@type": "ListItem", "position": 2, "name": article.category, "item": `https://www.theveritas.in/?category=${encodeURIComponent(article.category)}` } : null,
      { "@type": "ListItem", "position": article.category ? 3 : 2, "name": article.title, "item": `https://www.theveritas.in/article/${article.slug}` }
    ].filter(Boolean)
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": articleDescription,
    "image": article.hero_image ? [getStoryImageUrl(article.hero_image)] : undefined,
    "datePublished": article.published_at || undefined,
    "dateModified": article.updated_at || article.published_at || undefined,
    "articleSection": article.category || undefined,
    "mainEntityOfPage": `https://www.theveritas.in/article/${article.slug}`,
    "author": {
      "@type": "Person",
      "name": article.author_name?.trim() || "The Veritas Desk",
      "url": `https://www.theveritas.in/authors/${authorProfile.slug}`
    },
    "publisher": {
      "@type": "Organization",
      "name": "The Veritas",
      "logo": { "@type": "ImageObject", "url": "https://www.theveritas.in/LOGO.jpeg" }
    },
    "isPartOf": {
      "@type": "Product",
      "name": "The Veritas",
      "productID": "CAow96zGDA:openaccess"
    },
    "isAccessibleForFree": true
  };

  const renderedBlocks = (article.content_blocks || []).filter(Boolean);
  const paragraphIndexes = renderedBlocks.reduce((acc, block, index) => {
    if (block.type === "paragraph" || (!block.type && typeof block.text === "string")) acc.push(index);
    return acc;
  }, []);

  const adInsertionIndexes = new Set();
  if (paragraphIndexes.length > 3) {
    adInsertionIndexes.add(paragraphIndexes[0]);
    adInsertionIndexes.add(paragraphIndexes[2]);
  }

  return (
    <div className="max-w-6xl mx-auto w-full px-3 sm:px-4 py-6 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-10 overflow-x-hidden">
      <Seo
        title={`${article.title} | The Veritas`}
        description={articleDescription}
        path={`/article/${article.slug}`}
        canonical={`https://www.theveritas.in/article/${article.slug}`}
        image={article.hero_image || undefined}
        type="article"
        structuredData={[breadcrumbSchema, articleSchema]}
        keywords={articleKeywords}
        tags={Array.isArray(article.hashtags) ? article.hashtags : []}
      />

      {/* FIXED SCRIPT BLOCK: Consolidated into one tag with lazyOnload to stop hydration crashes */}
      {isMounted && (
        <Script 
          src="https://news.google.com/swg/js/v1/swg-basic.js" 
          strategy="lazyOnload" 
          onLoad={() => {
            if (!window.SWG_BASIC) return;
            window.SWG_BASIC.push(function (basicSubscriptions) {
              if (!basicSubscriptions) return;
              basicSubscriptions.init({
                type: "NewsArticle",
                isPartOfType: ["Product"],
                isPartOfProductId: "CAow96zGDA:openaccess",
                clientOptions: { theme: "light", lang: "en" },
              });
            });
          }}
        />
      )}

      <div className="md:col-span-8 min-w-0">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="text-sm uppercase tracking-wide" style={{ color: "var(--veritas-red)" }}>{article.category}</div>
          {article.is_editorial && <EditorialBadge />}
        </div>

        <h1 className="text-[2.3rem] sm:text-5xl md:text-[3.2rem] lg:text-[3.75rem] xl:text-[4.1rem] font-serif font-bold leading-[1.02] tracking-tight break-words">{article.title}</h1>
        <p className="text-neutral-400 italic mt-3 text-base sm:text-lg leading-relaxed">{article.subheadline}</p>
        <div className="border-b w-16 my-4" style={{ borderColor: "var(--veritas-red)" }}></div>
        <div className="text-sm text-neutral-500 mt-3">
          By <Link to={`/authors/${authorProfile.slug}`} className="text-white transition hover:text-[var(--veritas-red)]">{article.author_name?.trim() || "The Veritas Desk"}</Link> | {formatPublishedDateTime(article.published_at)}
        </div>

        <img
          src={getStoryImageUrl(article.hero_image)}
          className="my-6 sm:my-8 rounded-2xl w-full object-cover shadow-lg max-h-[520px]"
          style={{ objectPosition: getImageObjectPosition(article.hero_focus) }}
          alt={article.hero_caption || article.title}
          loading="eager"
        />

        <div className="space-y-5 sm:space-y-6 text-[17px] sm:text-[18px] leading-[1.9] text-white font-serif break-words">
          {renderedBlocks.map((block, i) => {
            const text = typeof block.text === "string" ? block.text : "";
            if (block.type === "subheading") return <h2 key={i} className="text-2xl font-bold mt-8 mb-3 text-white">{text}</h2>;
            if (block.type === "image" && text) return (
              <figure key={i} className="my-8 space-y-3">
                <img src={getStoryImageUrl(text)} alt={block.caption || ""} className="w-full rounded-2xl object-cover shadow-lg max-h-[560px]" loading="lazy" />
                {block.caption && <figcaption className="text-sm text-neutral-400">{block.caption}</figcaption>}
              </figure>
            );
            if (!text) return null;
            return (
              <React.Fragment key={i}>
                <p className={i === 0 ? "first-letter:text-5xl first-letter:font-bold first-letter:mr-2 first-letter:float-left" : ""}>{text}</p>
                {adInsertionIndexes.has(i) && <AdSlot slot={AD_SLOT_ARTICLE_INLINE} label="Advertisement" className="my-2 min-h-[180px]" />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="md:col-span-4 space-y-5 sm:space-y-6 md:sticky md:top-24 h-fit min-w-0">
        <div className="bg-neutral-900 border border-neutral-800 p-4 sm:p-5 rounded-2xl">
          <h3 className="font-serif text-2xl mb-4 border-b border-neutral-700 pb-2">Latest News</h3>
          <ul className="space-y-4 text-sm">
            {latest.map((item) => (
              <li key={item.id} className="flex gap-3">
                <div className="mt-1 shrink-0" style={{ color: "var(--veritas-red)" }}>◆</div>
                <Link to={`/article/${item.slug}`} className="hover:underline transition-all hover:text-white break-words">{item.title}</Link>
              </li>
            ))}
          </ul>
        </div>
        <AdSlot slot={AD_SLOT_ARTICLE_SIDEBAR} label="Advertisement" className="min-h-[250px]" />
      </div>
    </div>
  );
}