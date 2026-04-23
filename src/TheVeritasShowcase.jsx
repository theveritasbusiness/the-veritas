import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "./lib/router";
import { fetchArticles, fetchBreaking, loadCachedArticles, loadCachedBreaking } from "./api";
import AdSlot from "./components/AdSlot";
import MarketTickerTape from "./components/MarketTickerTape";
import Seo from "./components/Seo";
import { AD_SLOT_HOME_INLINE, AD_SLOT_HOME_SIDEBAR } from "./lib/env";
import { getCardImageUrl, getHeroImageUrl, getImageObjectPosition } from "./utils/cloudinary";
import { getArticleDisplayTime } from "./utils/time";

function EditorialBadge({ className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur ${className}`.trim()}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: "var(--veritas-red)" }}
      />
      Editorial
    </span>
  );
}

export default function TheVeritasShowcase({
  initialArticles = [],
  initialBreaking = [],
  initialLoadError = ""
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
  const heroSlides = useMemo(() => {
    if (sliderArticles.length > 0) {
      return sliderArticles;
    }

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

      if (cachedArticles.length > 0) {
        setArticles(cachedArticles);
      }

      if (cachedBreaking.length > 0) {
        setBreaking(cachedBreaking);
      }

      try {
        if (articles.length === 0 && breaking.length === 0) {
          setLoading(true);
        }
        const [allArticles, breakingArticles] = await Promise.all([
          fetchArticles(),
          fetchBreaking()
        ]);

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

    loadData();
  }, []);

  useEffect(() => {
    if (heroIndex > heroSlides.length - 1) {
      setHeroIndex(0);
    }
  }, [heroIndex, heroSlides.length]);

  useEffect(() => {
    if (heroSlides.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setHeroIndex((currentIndex) => (currentIndex + 1) % heroSlides.length);
    }, 6500);

    return () => window.clearInterval(intervalId);
  }, [heroSlides.length]);

  function goToHeroSlide(index) {
    if (heroSlides.length === 0) {
      return;
    }

    const normalizedIndex = (index + heroSlides.length) % heroSlides.length;
    setHeroIndex(normalizedIndex);
  }

  function handleHeroTouchStart(event) {
    touchStartX.current = event.touches?.[0]?.clientX ?? null;
  }

  function handleHeroTouchEnd(event) {
    if (touchStartX.current == null) {
      return;
    }

    const touchEndX = event.changedTouches?.[0]?.clientX ?? touchStartX.current;
    const deltaX = touchEndX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(deltaX) < 45 || heroSlides.length <= 1) {
      return;
    }

    if (deltaX < 0) {
      goToHeroSlide(heroIndex + 1);
      return;
    }

    goToHeroSlide(heroIndex - 1);
  }

  return (
    <div className="min-h-screen bg-black text-white antialiased font-sans overflow-x-hidden">
      <Seo
        title="The Veritas – Where the truth speaks itself"
        description="The Veritas brings latest business, analysis, market news, politics, sports, lifestyle, entertainment and trending stories to the world."
        path="/"
        absoluteTitle
      />
      <MarketTickerTape />

      {heroArticle && (
        <header className="max-w-6xl mx-auto px-3 sm:px-4 mt-4 sm:mt-6">
          <div
            className="relative"
            onTouchStart={handleHeroTouchStart}
            onTouchEnd={handleHeroTouchEnd}
          >
            <Link to={`/article/${heroArticle.slug}`}>
                <div className="relative min-h-[430px] sm:min-h-[470px] md:h-96 rounded-2xl overflow-hidden cursor-pointer">
                  <img
                    src={getHeroImageUrl(heroArticle.hero_image, heroArticle.hero_focus) || "https://via.placeholder.com/1200x600"}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover scale-[1.04] blur-sm opacity-45"
                    style={{ objectPosition: getImageObjectPosition(heroArticle.hero_focus) }}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />

                  <img
                    src={getHeroImageUrl(heroArticle.hero_image, heroArticle.hero_focus) || "https://via.placeholder.com/1200x600"}
                    alt={heroArticle.title || "Top story"}
                    className="absolute inset-0 h-full w-full object-contain"
                    style={{ objectPosition: getImageObjectPosition(heroArticle.hero_focus) }}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />

                {heroArticle.is_editorial ? (
                  <div className="absolute right-4 top-4 z-[1]">
                    <EditorialBadge />
                  </div>
                ) : null}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent p-5 sm:p-6 flex items-end">
                  <div className="max-w-3xl">
                    <div
                      className="font-semibold text-sm sm:text-base"
                      style={{ color: "var(--veritas-red)" }}
                    >
                      {heroArticle.is_breaking ? "BREAKING" : "TOP STORY"}
                    </div>

                      <h1 className="text-[2.4rem] sm:text-[2.95rem] md:text-[2.8rem] lg:text-[3.5rem] xl:text-[4rem] font-serif font-bold leading-[1.01] mt-2 break-words">
                        {heroArticle.title || "Loading..."}
                      </h1>

                    <p className="text-neutral-300 mt-3 max-w-2xl text-base sm:text-lg leading-relaxed">
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
                  ‹
                </button>

                <button
                  type="button"
                  onClick={() => goToHeroSlide(heroIndex + 1)}
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/55 px-3 py-2 text-white backdrop-blur transition hover:bg-black/75"
                  aria-label="Next hero article"
                >
                  ›
                </button>

                <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
                  {heroSlides.map((article, index) => (
                    <button
                      key={article.id || article.slug || index}
                      type="button"
                      onClick={() => goToHeroSlide(index)}
                      aria-label={`Go to hero article ${index + 1}`}
                      className={`h-2.5 rounded-full transition-all ${
                        index === heroIndex
                          ? "w-8 bg-[var(--veritas-red)]"
                          : "w-2.5 bg-white/45 hover:bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </header>
      )}

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
        {!loading && finalArticles.length === 0 && (
          <div className="col-span-12 text-center text-neutral-400 py-20">
            <div className="max-w-xl mx-auto rounded-2xl border border-neutral-800 bg-neutral-950 px-6 py-10">
              <h2 className="font-serif text-3xl text-white">No articles found.</h2>
              <p className="mt-3 text-sm sm:text-base text-neutral-400 leading-relaxed">
                {loadError
                  ? "We’re reconnecting to the latest story feed. Please check back in a moment."
                  : "The latest article feed is empty right now. Please check back shortly."}
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="col-span-12 text-center text-neutral-400 py-20">
            <div className="max-w-xl mx-auto rounded-2xl border border-neutral-800 bg-neutral-950 px-6 py-10">
              <div className="veritas-loader mx-auto" aria-hidden="true" />
              <div className="mt-5 font-serif text-2xl text-white">Loading stories</div>
              <p className="mt-3 text-sm sm:text-base text-neutral-400 leading-relaxed">
                Pulling in the latest Veritas stories now.
              </p>
            </div>
          </div>
        )}

        {finalArticles.length > 0 && (
          <section className="order-2 md:order-1 md:col-span-3 min-w-0">
            <div className="bg-neutral-900 border border-neutral-800 p-4 sm:p-5 rounded-2xl">
              <h3 className="font-serif text-[2rem] sm:text-2xl mb-3 border-b pb-3">Latest News</h3>
              <ul className="space-y-3 text-sm">
                {secondaryArticles.slice(0, 5).map((article) => (
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
                        className="leading-[1.65] font-medium hover:underline block break-words"
                      >
                        {article.title}
                      </Link>
                      <div className="text-xs text-neutral-400">{getArticleDisplayTime(article)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <AdSlot
              slot={AD_SLOT_HOME_SIDEBAR}
              label="Sponsored"
              className="mt-5 min-h-[220px]"
            />
          </section>
        )}

        {finalArticles.length > 0 && (
          <section className="order-1 md:order-2 md:col-span-6 space-y-5 sm:space-y-6 min-w-0">
            {featuredArticle && (
              <article className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-[140px,1fr] md:grid-cols-3 gap-4">
                <img
                  src={getCardImageUrl(featuredArticle.hero_image, featuredArticle.hero_focus) || ""}
                  className="rounded-xl object-cover h-44 sm:h-full md:h-[240px] w-full"
                  style={{ objectPosition: getImageObjectPosition(featuredArticle.hero_focus) }}
                  alt={featuredArticle.title}
                  loading="lazy"
                  decoding="async"
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

                  <p className="text-neutral-300 mt-2 text-sm leading-[1.65]">
                    {featuredArticle.subheadline || featuredArticle.paragraphs?.[0]?.slice(0, 120)}
                  </p>
                </div>
              </article>
            )}

            <AdSlot
              slot={AD_SLOT_HOME_INLINE}
              label="Sponsored"
              className="min-h-[160px]"
            />

            <div>
              <h3 className="font-serif text-xl mb-4">More Stories</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 sm:gap-6">
                {secondaryArticles.slice(1, 4).map((article) => (
                  <div
                    key={article.id}
                    className="rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:scale-[1.01] transition-transform shadow-sm min-w-0 md:grid md:grid-cols-[240px,1fr] md:min-h-[240px]"
                  >
                    {article.hero_image ? (
                      <img
                        src={getCardImageUrl(article.hero_image, article.hero_focus)}
                        alt={article.title}
                        className="hidden md:block h-full min-h-[240px] w-full object-cover"
                        style={{ objectPosition: getImageObjectPosition(article.hero_focus) }}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : null}

                    <div className="p-4 md:p-5 flex flex-col justify-between min-h-[240px]">
                      {article.is_editorial ? (
                        <div className="mb-3">
                          <EditorialBadge />
                        </div>
                      ) : null}
                      <div className="text-xs font-semibold" style={{ color: "var(--veritas-red)" }}>
                        {article.category}
                      </div>
                      <Link
                        to={`/article/${article.slug}`}
                        className="font-bold mt-2 block hover:underline break-words text-[1.05rem] leading-[1.45]"
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
                        className="text-sm text-neutral-400 mt-2 leading-[1.7]"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}
                      >
                        {article.subheadline || article.paragraphs?.[0]?.slice(0, 90)}
                      </p>
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
          <aside className="order-3 md:col-span-3 space-y-5 sm:space-y-6 min-w-0">
            <div className="bg-neutral-900 border border-neutral-800 p-4 sm:p-5 rounded-2xl">
              <h3 className="font-serif text-xl mb-4 border-b border-neutral-700 pb-2">
                Shorts
              </h3>

              <div className="space-y-4">
                {shorts.map((short) => (
                  <div
                    key={short.href}
                    className="overflow-hidden rounded-[1.75rem] border"
                    style={{ borderColor: "rgba(222, 2, 22, 0.35)" }}
                  >
                    <div
                      className="relative bg-black"
                      style={{ aspectRatio: "9 / 16" }}
                    >
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

        .ticker {
          animation: tickerMove 18s linear infinite;
          white-space: nowrap;
        }
        @keyframes veritasSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes veritasSpinReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes tickerMove {
          from { transform: translateX(100%); }
          to { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
