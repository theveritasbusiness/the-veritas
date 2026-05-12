import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "./lib/router";
import { fetchArticles, fetchBreaking, loadCachedArticles, loadCachedBreaking } from "./api";
import AdSlot from "./components/AdSlot";
import MarketTickerTape from "./components/MarketTickerTape";
import Seo from "./components/Seo";
import { AD_SLOT_HOME_INLINE, AD_SLOT_HOME_SIDEBAR } from "./lib/env";
import { getCardImageUrl, getHeroImageUrl, getImagePresentation } from "./utils/cloudinary";
import { getArticleDisplayTime } from "./utils/time";

const HOME_TITLE = "The Veritas - Where the truth speaks itself";
const HOME_DESCRIPTION =
  "The Veritas is a fearless voice for truth and justice. In an age of misinformation, we practice unbiased, fact-checked, and responsible journalism. We uncover hidden realities, amplify marginalized voices, and hold power to account going beyond headlines to report stories that truly impact society. The Veritas is not just a media house; it is a movement where truth speaks and justice prevails. Industry";

function EditorialBadge({ className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur ${className}`.trim()}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--veritas-red)" }} />
      Editorial
    </span>
  );
}

export default function TheVeritasShowcase({
  initialArticles = [],
  initialBreaking = [],
  initialLoadError = "",
  forcedCategory = "",
  pageTitle = HOME_TITLE,
  pageDescription = HOME_DESCRIPTION,
  pageCanonical = "https://www.theveritas.in/"
}) {
  const [articles, setArticles] = useState(initialArticles);
  const [breaking, setBreaking] = useState(initialBreaking);
  const [loading, setLoading] = useState(
    initialArticles.length === 0 && initialBreaking.length === 0 && !initialLoadError
  );
  const [loadError, setLoadError] = useState(initialLoadError);
  const [heroIndex, setHeroIndex] = useState(0);
  const [searchParams] = useSearchParams();
  const touchStartX = useRef(null);

  const searchQuery = searchParams.get("search") || "";
  const selectedCategory = forcedCategory || searchParams.get("category");
  const isFilteredHomeView =
    !forcedCategory && (Boolean(searchQuery) || Boolean(selectedCategory && selectedCategory !== "Home"));

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
    return article.category && article.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const sliderArticles = finalArticles.filter((article) => article.show_on_slider === true);
  const heroSlides = useMemo(() => {
    if (sliderArticles.length > 0) return sliderArticles;
    return finalArticles[0] ? [finalArticles[0]] : [];
  }, [finalArticles, sliderArticles]);

  const heroArticle = heroSlides[heroIndex] || heroSlides[0] || null;
  const secondaryArticles = finalArticles.filter((article) => article.slug !== heroArticle?.slug);
  const featuredArticle = secondaryArticles[0] || null;

  const shorts = [
    {
      type: "instagram",
      href: "https://www.instagram.com/reel/DUllbZmEjM4/",
      embed: "https://www.instagram.com/reel/DUllbZmEjM4/embed"
    },
    {
      type: "youtube",
      href: "https://www.youtube.com/shorts/h9919flODY8",
      embed: "https://www.youtube.com/embed/h9919flODY8"
    }
  ];

  useEffect(() => {
    async function loadData() {
      const cachedArticles = loadCachedArticles();
      const cachedBreaking = loadCachedBreaking();

      if (cachedArticles.length > 0) setArticles(cachedArticles);
      if (cachedBreaking.length > 0) setBreaking(cachedBreaking);

      try {
        if (articles.length === 0 && breaking.length === 0) setLoading(true);
        const [allArticles, breakingArticles] = await Promise.all([fetchArticles(), fetchBreaking()]);
        setArticles(allArticles);
        setBreaking(breakingArticles);
        setLoadError("");
      } catch (err) {
        console.error("Failed to load articles:", err);
        setLoadError(err.message || "Failed to load articles.");
      } finally {
        setLoading(false);
      }
    }

    if (initialArticles.length === 0 || initialBreaking.length === 0) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [initialArticles.length, initialBreaking.length]);

  useEffect(() => {
    if (heroIndex > heroSlides.length - 1) {
      setHeroIndex(0);
    }
  }, [heroIndex, heroSlides.length]);

  useEffect(() => {
    if (heroSlides.length <= 1) return undefined;
    const intervalId = window.setInterval(() => {
      setHeroIndex((currentIndex) => (currentIndex + 1) % heroSlides.length);
    }, 6500);
    return () => window.clearInterval(intervalId);
  }, [heroSlides.length]);

  function goToHeroSlide(index) {
    if (heroSlides.length === 0) return;
    setHeroIndex((index + heroSlides.length) % heroSlides.length);
  }

  function handleHeroTouchStart(event) {
    touchStartX.current = event.touches?.[0]?.clientX ?? null;
  }

  function handleHeroTouchEnd(event) {
    if (touchStartX.current == null) return;
    const touchEndX = event.changedTouches?.[0]?.clientX ?? touchStartX.current;
    const deltaX = touchEndX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(deltaX) < 45 || heroSlides.length <= 1) return;
    if (deltaX < 0) {
      goToHeroSlide(heroIndex + 1);
    } else {
      goToHeroSlide(heroIndex - 1);
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-black font-sans text-white antialiased">
      <Seo
        title={pageTitle}
        description={pageDescription}
        path="/"
        canonical={pageCanonical}
        robots={isFilteredHomeView ? "noindex,follow" : "index,follow"}
        absoluteTitle
      />

      <MarketTickerTape />

      {heroArticle && (
        <header className="mx-auto mt-4 max-w-6xl px-3 sm:mt-6 sm:px-4">
          <div className="relative" onTouchStart={handleHeroTouchStart} onTouchEnd={handleHeroTouchEnd}>
            <Link to={`/article/${heroArticle.slug}`}>
              <div className="relative min-h-[430px] cursor-pointer overflow-hidden rounded-2xl sm:min-h-[470px] md:h-96">
                <img
                  src={getHeroImageUrl(heroArticle.hero_image, heroArticle.hero_focus) || "https://via.placeholder.com/1200x600"}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover blur-sm opacity-45"
                  style={getImagePresentation(heroArticle.hero_focus, heroArticle.hero_crop)}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
                <img
                  src={getHeroImageUrl(heroArticle.hero_image, heroArticle.hero_focus) || "https://via.placeholder.com/1200x600"}
                  alt={heroArticle.title || "Top story"}
                  className="absolute inset-0 h-full w-full object-contain"
                  style={getImagePresentation(heroArticle.hero_focus, heroArticle.hero_crop)}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />

                {heroArticle.is_editorial ? (
                  <div className="absolute right-4 top-4 z-[1]">
                    <EditorialBadge />
                  </div>
                ) : null}

                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black via-black/55 to-transparent p-5 sm:p-6">
                  <div className="max-w-3xl">
                    <div className="text-sm font-semibold sm:text-base" style={{ color: "var(--veritas-red)" }}>
                      {heroArticle.is_breaking ? "BREAKING" : "TOP STORY"}
                    </div>

                    <h1 className="mt-2 break-words font-serif text-[2.4rem] font-bold leading-[1.01] sm:text-[2.95rem] md:text-[2.8rem] lg:text-[3.5rem] xl:text-[4rem]">
                      {heroArticle.title || "Loading..."}
                    </h1>

                    <p className="mt-3 max-w-2xl text-base leading-relaxed text-neutral-300 sm:text-lg">
                      {heroArticle.subheadline || heroArticle.paragraphs?.[0]?.slice(0, 140)}
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {heroSlides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goToHeroSlide(heroIndex - 1)}
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/55 px-3 py-2 text-white backdrop-blur transition hover:bg-black/75"
                  aria-label="Previous hero article"
                >
                  &#8249;
                </button>

                <button
                  type="button"
                  onClick={() => goToHeroSlide(heroIndex + 1)}
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/55 px-3 py-2 text-white backdrop-blur transition hover:bg-black/75"
                  aria-label="Next hero article"
                >
                  &#8250;
                </button>

                <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
                  {heroSlides.map((article, index) => (
                    <button
                      key={article.id || article.slug || index}
                      type="button"
                      onClick={() => goToHeroSlide(index)}
                      aria-label={`Go to hero article ${index + 1}`}
                      className={`h-2.5 rounded-full transition-all ${
                        index === heroIndex ? "w-8 bg-[var(--veritas-red)]" : "w-2.5 bg-white/45 hover:bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </header>
      )}

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-3 py-6 sm:gap-6 sm:px-4 sm:py-8 md:grid-cols-12">
        {!loading && finalArticles.length === 0 && (
          <div className="col-span-12 py-20 text-center text-neutral-400">
            <div className="mx-auto max-w-xl rounded-2xl border border-neutral-800 bg-neutral-950 px-6 py-10">
              <h2 className="font-serif text-3xl text-white">No articles found.</h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-400 sm:text-base">
                {loadError
                  ? "We're reconnecting to the latest story feed. Please check back in a moment."
                  : "The latest article feed is empty right now. Please check back shortly."}
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="col-span-12 py-20 text-center text-neutral-400">
            <div className="mx-auto max-w-xl rounded-2xl border border-neutral-800 bg-neutral-950 px-6 py-10">
              <div className="veritas-loader mx-auto" aria-hidden="true" />
              <div className="mt-5 font-serif text-2xl text-white">Loading stories</div>
              <p className="mt-3 text-sm leading-relaxed text-neutral-400 sm:text-base">
                Pulling in the latest Veritas stories now.
              </p>
            </div>
          </div>
        )}

        {finalArticles.length > 0 && (
          <section className="order-2 min-w-0 md:order-1 md:col-span-3">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:p-5">
              <h3 className="mb-3 border-b pb-3 font-serif text-[2rem] sm:text-2xl">Latest News</h3>
              <ul className="space-y-3 text-sm">
                {secondaryArticles.slice(0, 5).map((article) => (
                  <li
                    key={article.id}
                    className="flex items-start gap-3 rounded-xl p-2 transition-all hover:bg-neutral-800"
                  >
                    <div className="mt-1 shrink-0" style={{ color: "var(--veritas-red)" }}>
                      &#9670;
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={`/article/${article.slug}`}
                        className="block break-words font-medium leading-[1.65] hover:underline"
                      >
                        {article.title}
                      </Link>
                      <div className="text-xs text-neutral-400">{getArticleDisplayTime(article)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <AdSlot slot={AD_SLOT_HOME_SIDEBAR} label="Sponsored" className="mt-5 min-h-[220px]" />
          </section>
        )}

        {finalArticles.length > 0 && (
          <section className="order-1 min-w-0 space-y-5 sm:space-y-6 md:order-2 md:col-span-6">
            {featuredArticle && (
              <article className="grid grid-cols-1 gap-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:grid-cols-[140px,1fr] md:grid-cols-3">
                <img
                  src={getCardImageUrl(featuredArticle.hero_image, featuredArticle.hero_focus) || ""}
                  className="h-44 w-full rounded-xl object-cover sm:h-full md:h-[240px]"
                  style={getImagePresentation(featuredArticle.hero_focus, featuredArticle.hero_crop)}
                  alt={featuredArticle.title}
                  loading="lazy"
                  decoding="async"
                />

                <div className="min-w-0 md:col-span-2">
                  <div className="text-sm" style={{ color: "var(--veritas-red)" }}>
                    {featuredArticle.category?.toUpperCase() || ""}
                  </div>

                  <Link
                    to={`/article/${featuredArticle.slug}`}
                    className="mt-2 block break-words font-serif text-2xl font-bold hover:underline sm:text-[2rem]"
                  >
                    {featuredArticle.title}
                  </Link>

                  <p className="mt-2 text-sm leading-[1.65] text-neutral-300">
                    {featuredArticle.subheadline || featuredArticle.paragraphs?.[0]?.slice(0, 120)}
                  </p>
                </div>
              </article>
            )}

            <AdSlot slot={AD_SLOT_HOME_INLINE} label="Sponsored" className="min-h-[160px]" />

            <div>
              <h3 className="mb-4 font-serif text-xl">More Stories</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-1">
                {secondaryArticles.slice(1, 4).map((article) => (
                  <div
                    key={article.id}
                    className="min-w-0 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-sm transition-transform hover:scale-[1.01] md:grid md:min-h-[240px] md:grid-cols-[240px,1fr]"
                  >
                    {article.hero_image ? (
                      <img
                        src={getCardImageUrl(article.hero_image, article.hero_focus)}
                        alt={article.title}
                        className="hidden h-full min-h-[240px] w-full object-cover md:block"
                        style={getImagePresentation(article.hero_focus, article.hero_crop)}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : null}

                    <div className="relative flex min-h-[240px] flex-col justify-between p-4 md:p-5">
                      {article.is_editorial ? (
                        <div className="mb-3">
                          <EditorialBadge />
                        </div>
                      ) : null}
                      <div>
                        <div className="text-xs font-semibold" style={{ color: "var(--veritas-red)" }}>
                          {article.category}
                        </div>
                        <Link
                          to={`/article/${article.slug}`}
                          className="mt-2 block break-words text-[1.05rem] font-bold leading-[1.45] hover:underline"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden"
                          }}
                        >
                          {article.title}
                        </Link>

                        <p
                          className="mt-2 text-sm leading-[1.7] text-neutral-400"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden"
                          }}
                        >
                          {article.subheadline || article.paragraphs?.[0]?.slice(0, 90)}
                        </p>
                      </div>
                      <div className="mt-3">
                        <span className="text-xs text-neutral-400">{getArticleDisplayTime(article)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {finalArticles.length > 0 && (
          <aside className="order-3 min-w-0 space-y-5 sm:space-y-6 md:col-span-3">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:p-5">
              <h3 className="mb-4 border-b border-neutral-700 pb-2 font-serif text-xl">Shorts</h3>

              <div className="space-y-4">
                {shorts.map((short) => (
                  <div
                    key={short.href}
                    className="overflow-hidden rounded-[1.75rem] border"
                    style={{ borderColor: "rgba(222, 2, 22, 0.35)" }}
                  >
                    <div className="relative bg-black" style={{ aspectRatio: "9 / 16" }}>
                      <iframe
                        src={short.embed}
                        title={`${short.type === "youtube" ? "YouTube short" : "Instagram reel"} ${short.href}`}
                        className="absolute inset-0 h-full w-full"
                        loading="lazy"
                        allowTransparency={true}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                    <a
                      href={short.href}
                      target="_blank"
                      rel="noreferrer"
                      className="block px-4 py-3 text-sm font-medium text-white transition-colors hover:text-[var(--veritas-red)]"
                    >
                      Watch Reel
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}
      </main>

      <style>{`
        .veritas-loader {
          width: 68px;
          height: 68px;
          border-radius: 999px;
          border: 3px solid rgba(255,255,255,0.12);
          border-top-color: var(--veritas-red);
          border-right-color: #fecc1c;
          position: relative;
          animation: veritasSpin 1s linear infinite;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.03) inset,
            0 0 24px rgba(222, 2, 22, 0.18);
        }

        .veritas-loader::before,
        .veritas-loader::after {
          content: "";
          position: absolute;
          inset: 11px;
          border-radius: 999px;
          border: 2px solid transparent;
        }

        .veritas-loader::before {
          border-left-color: #fecc1c;
          border-bottom-color: rgba(222, 2, 22, 0.9);
          animation: veritasSpinReverse 1.4s linear infinite;
        }

        .veritas-loader::after {
          inset: 24px;
          background:
            radial-gradient(circle, #fecc1c 0 18%, transparent 20%),
            radial-gradient(circle, rgba(222, 2, 22, 0.9) 0 14%, transparent 16%);
          background-position: 50% 28%, 50% 72%;
          background-repeat: no-repeat;
          filter: drop-shadow(0 0 10px rgba(222, 2, 22, 0.35));
        }

        @keyframes veritasSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes veritasSpinReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
