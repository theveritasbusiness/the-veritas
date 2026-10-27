import React from "react";
import { Link } from "../lib/router";
import { getCategoryConfigByName, getCategoryPath } from "../content/categories";
import { getCardImageUrl, getImagePresentation } from "../utils/cloudinary";
import { getArticleDisplayTime } from "../utils/time";

// Same pill styles as the Live / Editorial badges on the article and home cards.
function Badge({ live = false, children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-white ${
        live ? "bg-[var(--veritas-red)]" : "border border-white/15 bg-black/70"
      }`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: live ? "#fff" : "var(--veritas-red)" }}
      />
      {children}
    </span>
  );
}

// "Read More" under an article: the latest stories from the same category, with
// a link through to that category's page. Sits on the article's own 12-column
// grid so it lines up with the body text above it.
export default function ReadMore({ articles = [], category = "" }) {
  if (articles.length === 0) return null;

  const categoryName = getCategoryConfigByName(category)?.name || category;
  const categoryPath = getCategoryPath(category);

  return (
    <section
      aria-label={`More from ${categoryName}`}
      className="mx-auto grid w-full grid-cols-1 px-3 pb-12 sm:px-4 md:max-w-[85%] md:grid-cols-12 xl:max-w-7xl"
    >
      <div className="min-w-0 md:col-span-10 md:col-start-3">
        <div className="border-t border-neutral-800 pt-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
                More from {categoryName}
              </div>
              <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-white sm:text-[1.7rem]">
                Read More
              </h2>
            </div>
            {categoryPath !== "/" ? (
              <Link
                to={categoryPath}
                className="group inline-flex shrink-0 items-center gap-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:text-[var(--veritas-red)]"
              >
                View all stories
                <span
                  aria-hidden="true"
                  className="text-base text-[var(--veritas-red)] transition-transform group-hover:translate-x-1"
                >
                  &rarr;
                </span>
              </Link>
            ) : null}
          </div>
          {/* Same short red rule the article uses under its own headline. */}
          <div className="mt-3 w-16 border-b" style={{ borderColor: "var(--veritas-red)" }} />
        </div>

        <div className="mt-5 divide-y divide-neutral-800">
          {articles.map((article) => (
            <Link
              key={article.id || article.slug}
              to={`/article/${article.slug}`}
              className="group flex items-start gap-4 py-4 first:pt-0 sm:gap-5"
            >
              {/* Plain image, no frame; a dark placeholder keeps rows aligned when
                  there is no image. The zoom sits on a wrapper because the crop
                  already uses the img's own transform. */}
              <div className="relative aspect-video w-28 flex-shrink-0 overflow-hidden rounded-md bg-neutral-900 sm:w-44">
                {article.hero_image ? (
                  <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-105">
                    <img
                      src={getCardImageUrl(article.hero_image, article.hero_focus)}
                      alt=""
                      className="h-full w-full object-cover"
                      style={getImagePresentation(article.hero_focus, article.hero_crop)}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--veritas-red)]">
                    {article.category || categoryName}
                  </span>
                  {article.is_live ? <Badge live>Live</Badge> : null}
                  {article.is_editorial ? <Badge>Editorial</Badge> : null}
                </div>
                <h3 className="mt-1 line-clamp-3 font-serif text-base font-bold leading-snug text-white group-hover:underline sm:text-lg">
                  {article.title}
                </h3>
                {article.subheadline ? (
                  // Wrapper does the show/hide; line-clamp needs its own display value.
                  <div className="mt-1 hidden sm:block">
                    <p className="line-clamp-2 font-serif text-sm leading-relaxed text-neutral-400">
                      {article.subheadline}
                    </p>
                  </div>
                ) : null}
                {/* Matches the article header byline: "By Author | time". */}
                <div className="mt-2 text-sm text-neutral-500">
                  By <span className="text-white">{article.author_name?.trim() || "The Veritas Desk"}</span>
                  {" "}| {getArticleDisplayTime(article)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
