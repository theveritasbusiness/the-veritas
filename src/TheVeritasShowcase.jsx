import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "./lib/router";
import {
  fetchArticles,
  fetchBreaking,
  fetchSubcategories,
  loadCachedArticles,
  loadCachedBreaking
} from "./api";
import AdSlot from "./components/AdSlot";
import MarketTickerTape from "./components/MarketTickerTape";
import Seo from "./components/Seo";
import Head from "next/head";
import { AD_SLOT_HOME_INLINE } from "./lib/env";
import { getCategoryConfigByName, getCategoryPath } from "./content/categories";
import { getCardImageUrl, getHeroImageUrl, getImagePresentation } from "./utils/cloudinary";
import { getArticleDisplayTime } from "./utils/time";
import ElectionResultsSection from "./ElectionResultsSection";

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
  initialSubcategories = [],
  initialLoadError = "",
  forcedCategory = "",
  pageTitle = HOME_TITLE,
  pageDescription = HOME_DESCRIPTION,
  pageCanonical = "https://www.theveritas.in/"
}) {
  const [articles, setArticles] = useState(initialArticles);
  const [breaking, setBreaking] = useState(initialBreaking);
  const [subcategories, setSubcategories] = useState(initialSubcategories);
  const [loading, setLoading] = useState(
    initialArticles.length === 0 && initialBreaking.length === 0 && !initialLoadError
  );
  const [loadError, setLoadError] = useState(initialLoadError);
  const [activeIndex, setActiveIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [searchParams] = useSearchParams();
  const touchStartX = useRef(null);

  const searchQuery = searchParams.get("search") || "";
  const selectedCategory = forcedCategory || searchParams.get("category");
  const selectedSubcategory = searchParams.get("subcategory") || "";
  const isFilteredHomeView =
    !forcedCategory &&
    (Boolean(searchQuery) ||
      Boolean(selectedCategory && selectedCategory !== "Home") ||
      Boolean(selectedSubcategory));

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
    const categoryMatches =
      !selectedCategory ||
      selectedCategory === "Home" ||
      (article.category && article.category.toLowerCase() === selectedCategory.toLowerCase());

    if (!categoryMatches) return false;

    if (!selectedSubcategory) return true;

    return (
      article.subcategory_slug?.toLowerCase() === selectedSubcategory.toLowerCase() ||
      article.subcategory?.toLowerCase() === selectedSubcategory.toLowerCase()
    );
  });

  const sliderArticles = finalArticles.filter((article) => article.show_on_slider === true);
  const heroSlides = useMemo(() => {
    if (sliderArticles.length > 0) return sliderArticles;
    return finalArticles[0] ? [finalArticles[0]] : [];
  }, [finalArticles, sliderArticles]);

  const activeLogicalIndex = useMemo(() => {
    if (heroSlides.length <= 1) return 0;
    let idx = activeIndex - 1;
    if (idx < 0) return heroSlides.length - 1;
    if (idx >= heroSlides.length) return 0;
    return idx;
  }, [activeIndex, heroSlides.length]);

  const heroArticle = heroSlides[activeLogicalIndex] || heroSlides[0] || null;

  const gridArticles = useMemo(() => {
    const slideSlugs = new Set(heroSlides.map((s) => s.slug));
    let filtered = finalArticles.filter((a) => !slideSlugs.has(a.slug));
    if (filtered.length < 5) {
      filtered = finalArticles.filter((a) => a.slug !== heroArticle?.slug);
    }
    return filtered;
  }, [finalArticles, heroSlides, heroArticle]);

  const moreTopStoriesData = useMemo(() => {
    const consumedSlugs = new Set();

    heroSlides.forEach((slide) => {
      if (slide && slide.slug) {
        consumedSlugs.add(slide.slug);
      }
    });

    gridArticles.slice(0, 10).forEach((article) => {
      if (article && article.slug) {
        consumedSlugs.add(article.slug);
      }
    });

    const unusedArticles = finalArticles.filter((article) => !consumedSlugs.has(article.slug));

    if (unusedArticles.length < 3) {
      return null;
    }

    const featuredStory = unusedArticles[0];
    const headlineList = unusedArticles.slice(1, 7);
    const mostReadList = unusedArticles.slice(7, 11);

    return {
      featuredStory,
      headlineList,
      mostReadList
    };
  }, [finalArticles, heroSlides, gridArticles]);

  const shouldShowSubcategorySections =
    !forcedCategory && !searchQuery && !selectedCategory && !selectedSubcategory;

  const homepageSubcategorySections = useMemo(() => {
    if (!shouldShowSubcategorySections) return [];

    return subcategories
      .map((subcategory) => {
        const sectionArticles = articles.filter(
          (article) =>
            article.subcategory_slug === subcategory.slug &&
            article.category === subcategory.category
        );

        if (sectionArticles.length === 0) {
          return null;
        }

        const leadArticle = sectionArticles[0];
        const supportingArticles = sectionArticles.slice(1, 5);
        const categoryConfig = getCategoryConfigByName(subcategory.category);

        return {
          ...subcategory,
          categoryPath: categoryConfig
            ? `${getCategoryPath(categoryConfig.slug)}?subcategory=${subcategory.slug}`
            : "/",
          leadArticle,
          supportingArticles
        };
      })
      .filter(Boolean);
  }, [articles, shouldShowSubcategorySections, subcategories]);

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
        const subcategoryData = await fetchSubcategories().catch(() => []);
        setArticles(allArticles);
        setBreaking(breakingArticles);
        setSubcategories(Array.isArray(subcategoryData) ? subcategoryData : []);
        setLoadError("");
      } catch (err) {
        console.error("Failed to load articles:", err);
        setLoadError(err.message || "Failed to load articles.");
      } finally {
        setLoading(false);
      }
    }

    if (initialArticles.length === 0 || initialBreaking.length === 0 || initialSubcategories.length === 0) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [initialArticles.length, initialBreaking.length, initialSubcategories.length]);

  const extendedSlides = useMemo(() => {
    if (heroSlides.length <= 1) return heroSlides;
    return [
      heroSlides[heroSlides.length - 1],
      ...heroSlides,
      heroSlides[0]
    ];
  }, [heroSlides]);

  useEffect(() => {
    if (activeIndex > extendedSlides.length - 1) {
      setActiveIndex(1);
    }
  }, [activeIndex, extendedSlides.length]);

  useEffect(() => {
    if (heroSlides.length <= 1) return undefined;
    const intervalId = window.setInterval(() => {
      setActiveIndex((prev) => prev + 1);
    }, 6500);
    return () => window.clearInterval(intervalId);
  }, [heroSlides.length]);

  useEffect(() => {
    if (!isTransitioning) {
      const forceRepaint = document.body.offsetHeight;
      setIsTransitioning(true);
    }
  }, [isTransitioning]);

  const handleTransitionEnd = () => {
    if (activeIndex === 0) {
      setIsTransitioning(false);
      setActiveIndex(heroSlides.length);
    } else if (activeIndex === heroSlides.length + 1) {
      setIsTransitioning(false);
      setActiveIndex(1);
    }
  };

  const handlePrev = () => {
    if (activeIndex <= 0) return;
    setIsTransitioning(true);
    setActiveIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (activeIndex >= heroSlides.length + 1) return;
    setIsTransitioning(true);
    setActiveIndex((prev) => prev + 1);
  };

  function goToHeroSlide(index) {
    if (heroSlides.length === 0) return;
    setIsTransitioning(true);
    setActiveIndex(index + 1);
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
      handleNext();
    } else {
      handlePrev();
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

      {heroArticle && heroArticle.hero_image ? (
        <Head>
          <link rel="preload" as="image" href={getHeroImageUrl(heroArticle.hero_image, heroArticle.hero_focus)} />
        </Head>
      ) : null}

      <MarketTickerTape />

      {/* ── HERO SLIDER (At the Top) ── */}
      {heroArticle && (
        <header className="mx-auto mt-4 max-w-7xl px-3 sm:mt-6 sm:px-4">
          <div className="relative overflow-hidden rounded-md min-h-[430px] sm:min-h-[470px] md:h-96 bg-black" onTouchStart={handleHeroTouchStart} onTouchEnd={handleHeroTouchEnd}>
            <div
              className="absolute inset-0 flex w-full h-full"
              style={{
                transform: `translate3d(-${activeIndex * 100}%, 0, 0)`,
                transition: isTransitioning ? "transform 700ms cubic-bezier(0.25, 1, 0.5, 1)" : "none"
              }}
              onTransitionEnd={handleTransitionEnd}
            >
              {extendedSlides.map((slide, index) => (
                <div
                  key={`extended-slide-${index}-${slide.id || slide.slug}`}
                  className="relative h-full w-full flex-shrink-0 cursor-pointer"
                >
                  <Link to={`/article/${slide.slug}`} className="block h-full w-full relative">
                    <img
                      src={getHeroImageUrl(slide.hero_image, slide.hero_focus) || "https://via.placeholder.com/1200x600"}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-cover blur-sm opacity-45"
                      style={getImagePresentation(slide.hero_focus, slide.hero_crop)}
                      loading={index === 1 ? "eager" : "lazy"}
                      decoding="async"
                    />
                    <img
                      src={getHeroImageUrl(slide.hero_image, slide.hero_focus) || "https://via.placeholder.com/1200x600"}
                      alt={slide.title || "Top story"}
                      className="absolute inset-0 h-full w-full object-contain"
                      style={getImagePresentation(slide.hero_focus, slide.hero_crop)}
                      loading={index === 1 ? "eager" : "lazy"}
                      decoding="async"
                    />

                    {slide.is_editorial ? (
                      <div className="absolute right-4 top-4 z-[1]">
                        <EditorialBadge />
                      </div>
                    ) : null}

                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black via-black/55 to-transparent p-5 sm:p-6 text-left">
                      <div className="max-w-3xl">
                        <div className="text-sm font-semibold sm:text-base" style={{ color: "var(--veritas-red)" }}>
                          {slide.is_breaking ? "BREAKING" : "TOP STORY"}
                        </div>

                        <h1 className="mt-2 break-words font-serif text-[2.4rem] font-bold leading-[1.01] sm:text-[2.95rem] md:text-[2.8rem] lg:text-[3.5rem] xl:text-[4rem] text-white">
                          {slide.title || "Loading..."}
                        </h1>

                        <p className="mt-3 max-w-2xl text-base leading-relaxed text-neutral-300 sm:text-lg">
                          {slide.subheadline || slide.paragraphs?.[0]?.slice(0, 140)}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {heroSlides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/55 px-3 py-2 text-white backdrop-blur transition hover:bg-black/75"
                  aria-label="Previous hero article"
                >
                  &#8249;
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/55 px-3 py-2 text-white backdrop-blur transition hover:bg-black/75"
                  aria-label="Next hero article"
                >
                  &#8250;
                </button>

                <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
                  {heroSlides.map((slide, index) => (
                    <button
                      key={`hero-dot-${index}-${slide.id || slide.slug}`}
                      type="button"
                      onClick={() => goToHeroSlide(index)}
                      aria-label={`Go to hero article ${index + 1}`}
                      className={`h-2.5 rounded-full transition-all ${index === activeLogicalIndex ? "w-8 bg-[var(--veritas-red)]" : "w-2.5 bg-white/45 hover:bg-white/70"
                        }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </header>
      )}

      {/* ── SECTION 1: 3-Column Grid below Hero Slider ── */}
      {gridArticles.length > 0 && (
        <section className="mx-auto mt-6 max-w-7xl px-3 sm:mt-8 sm:px-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_2fr_1fr]">

            {/* Left Column — 2 side articles */}
            <div className="order-2 grid grid-cols-2 gap-4 lg:order-1 lg:grid-cols-1">
              {gridArticles.slice(1, 3).map((article) => (
                <Link
                  key={article.id}
                  to={`/article/${article.slug}`}
                  className="group flex flex-col overflow-hidden rounded-md border border-neutral-800 bg-neutral-900 transition-all hover:border-neutral-600"
                >
                  <div className="relative h-32 flex-shrink-0 overflow-hidden sm:h-36 lg:h-40">
                    {article.hero_image ? (
                      <img
                        src={getCardImageUrl(article.hero_image, article.hero_focus)}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        style={getImagePresentation(article.hero_focus, article.hero_crop)}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-neutral-950 text-[10px] uppercase tracking-widest text-neutral-600">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-3">
                    <div>
                      <div
                        className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                        style={{ color: "var(--veritas-red)" }}
                      >
                        {article.category?.toUpperCase()}
                      </div>
                      <h3
                        className="mt-1.5 text-sm font-bold leading-snug group-hover:underline sm:text-[0.95rem]"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}
                      >
                        {article.title}
                      </h3>
                    </div>
                    <span className="mt-2 text-[10.5px] text-neutral-500">
                      {getArticleDisplayTime(article)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Center — 1 Main article */}
            <div className="order-1 lg:order-2">
              {gridArticles[0] && (
                <Link
                  to={`/article/${gridArticles[0].slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-md border border-neutral-800 bg-neutral-900 transition-all hover:border-neutral-600"
                >
                  <div className="relative h-60 flex-shrink-0 overflow-hidden sm:h-72 lg:h-[320px]">
                    {gridArticles[0].hero_image ? (
                      <img
                        src={getHeroImageUrl(gridArticles[0].hero_image, gridArticles[0].hero_focus)}
                        alt={gridArticles[0].title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        style={getImagePresentation(gridArticles[0].hero_focus, gridArticles[0].hero_crop)}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-neutral-950 text-[10px] uppercase tracking-widest text-neutral-600">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                    <div>
                      <div
                        className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                        style={{ color: "var(--veritas-red)" }}
                      >
                        {gridArticles[0].category?.toUpperCase()}
                      </div>
                      <h2 className="mt-2 font-serif text-xl font-bold leading-snug group-hover:underline sm:text-2xl text-white">
                        {gridArticles[0].title}
                      </h2>
                      <p
                        className="mt-2 text-sm leading-relaxed text-neutral-400"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}
                      >
                        {gridArticles[0].subheadline || gridArticles[0].paragraphs?.[0]?.slice(0, 140)}
                      </p>
                    </div>
                    <span className="mt-3 text-xs text-neutral-500">
                      {getArticleDisplayTime(gridArticles[0])}
                    </span>
                  </div>
                </Link>
              )}
            </div>

            {/* Right Column — 2 side articles */}
            <div className="order-3 grid grid-cols-2 gap-4 lg:grid-cols-1">
              {gridArticles.slice(3, 5).map((article) => (
                <Link
                  key={article.id}
                  to={`/article/${article.slug}`}
                  className="group flex flex-col overflow-hidden rounded-md border border-neutral-800 bg-neutral-900 transition-all hover:border-neutral-600"
                >
                  <div className="relative h-32 flex-shrink-0 overflow-hidden sm:h-36 lg:h-40">
                    {article.hero_image ? (
                      <img
                        src={getCardImageUrl(article.hero_image, article.hero_focus)}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        style={getImagePresentation(article.hero_focus, article.hero_crop)}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-neutral-950 text-[10px] uppercase tracking-widest text-neutral-600">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-3">
                    <div>
                      <div
                        className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                        style={{ color: "var(--veritas-red)" }}
                      >
                        {article.category?.toUpperCase()}
                      </div>
                      <h3
                        className="mt-1.5 text-sm font-bold leading-snug group-hover:underline sm:text-[0.95rem]"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}
                      >
                        {article.title}
                      </h3>
                    </div>
                    <span className="mt-2 text-[10.5px] text-neutral-500">
                      {getArticleDisplayTime(article)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* Loading state */}
      {loading && (
        <div className="mx-auto max-w-7xl px-3 py-20 text-center text-neutral-400 sm:px-4">
          <div className="mx-auto max-w-xl rounded-md border border-neutral-800 bg-neutral-950 px-6 py-10">
            <div className="veritas-loader mx-auto" aria-hidden="true" />
            <div className="mt-5 font-serif text-2xl text-white">Loading stories</div>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400 sm:text-base">
              Pulling in the latest Veritas stories now.
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && finalArticles.length === 0 && (
        <div className="mx-auto max-w-7xl px-3 py-20 text-center text-neutral-400 sm:px-4">
          <div className="mx-auto max-w-xl rounded-md border border-neutral-800 bg-neutral-950 px-6 py-10">
            <h2 className="font-serif text-3xl text-white">No articles found.</h2>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400 sm:text-base">
              {loadError
                ? "We're reconnecting to the latest story feed. Please check back in a moment."
                : "The latest article feed is empty right now. Please check back shortly."}
            </p>
          </div>
        </div>
      )}

      {/* ── SECTION 2: Latest News ── */}
      {finalArticles.length > 0 && (
        <section className="mx-auto max-w-7xl px-3 py-8 sm:px-4 sm:py-10">
          <div className="mb-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
            <h2 className="whitespace-nowrap font-serif text-2xl font-bold tracking-tight sm:text-3xl text-white">
              Latest News
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
          </div>

          {/* 2 large main articles */}
          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            {gridArticles.slice(5, 7).map((article) => (
              <Link
                key={article.id}
                to={`/article/${article.slug}`}
                className="group overflow-hidden rounded-md border border-neutral-800 bg-neutral-900 transition-all hover:border-neutral-600"
              >
                <div className="relative h-52 overflow-hidden sm:h-64">
                  {article.hero_image ? (
                    <img
                      src={getHeroImageUrl(article.hero_image, article.hero_focus)}
                      alt={article.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={getImagePresentation(article.hero_focus, article.hero_crop)}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-4 sm:p-5">
                  <div
                    className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                    style={{ color: "var(--veritas-red)" }}
                  >
                    {article.category?.toUpperCase()}
                  </div>
                  <h3 className="mt-2 font-serif text-xl font-bold leading-snug group-hover:underline sm:text-2xl text-white">
                    {article.title}
                  </h3>
                  <p
                    className="mt-2 text-sm leading-relaxed text-neutral-400"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}
                  >
                    {article.subheadline || article.paragraphs?.[0]?.slice(0, 150)}
                  </p>
                  <span className="mt-3 inline-block text-xs text-neutral-500">
                    {getArticleDisplayTime(article)}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* 3 smaller articles */}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3">
            {gridArticles.slice(7, 10).map((article) => (
              <Link
                key={article.id}
                to={`/article/${article.slug}`}
                className="group overflow-hidden rounded-md border border-neutral-800 bg-neutral-900 transition-all hover:border-neutral-600"
              >
                <div className="relative h-40 overflow-hidden sm:h-44">
                  {article.hero_image ? (
                    <img
                      src={getCardImageUrl(article.hero_image, article.hero_focus)}
                      alt={article.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={getImagePresentation(article.hero_focus, article.hero_crop)}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                </div>
                <div className="p-3 sm:p-4">
                  <div
                    className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                    style={{ color: "var(--veritas-red)" }}
                  >
                    {article.category?.toUpperCase()}
                  </div>
                  <h3
                    className="mt-1.5 text-[0.9rem] font-bold leading-snug group-hover:underline text-white"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}
                  >
                    {article.title}
                  </h3>
                  <span className="mt-2 inline-block text-[11px] text-neutral-500">
                    {getArticleDisplayTime(article)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Inline Ad */}
      {finalArticles.length > 0 && (
        <div className="mx-auto max-w-7xl px-3 sm:px-4">
          <AdSlot slot={AD_SLOT_HOME_INLINE} label="Sponsored" className="min-h-[140px] rounded-md" />
        </div>
      )}

      {/* ── SECTION 3: Latest Videos ── */}
      {shorts.length > 0 && (
        <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8">
          <div className="mb-5 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
            <h2 className="whitespace-nowrap font-serif text-xl font-bold tracking-tight sm:text-2xl text-white">
              Latest Videos
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
          </div>

          <div className="veritas-shorts-row flex gap-4 overflow-x-auto pb-4">
            {shorts.map((short) => (
              <div
                key={short.href}
                className="w-[240px] flex-shrink-0 overflow-hidden rounded-md border bg-neutral-900 sm:w-[260px]"
                style={{ borderColor: "rgba(222, 2, 22, 0.25)" }}
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
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-white transition-colors hover:text-[var(--veritas-red)]"
                >
                  {short.type === "youtube" ? "Watch Short" : "Watch Reel"}
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── SECTION 4: More Top Stories ── */}
      {moreTopStoriesData && (
        <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8">
          <div className="mb-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
            <h2 className="whitespace-nowrap font-serif text-2xl font-bold tracking-tight sm:text-3xl text-white">
              More Top Stories
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-[40%_38%_22%] items-stretch">

            {/* Left Column (Featured story card) — roughly 40% width */}
            <div className="flex flex-col">
              <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                More Top Stories
              </div>
              <div className="h-px bg-neutral-800 mb-4" />

              <Link
                to={`/article/${moreTopStoriesData.featuredStory.slug}`}
                className="group flex flex-col h-full overflow-hidden rounded-md border border-neutral-800 bg-neutral-900 transition-all hover:border-neutral-600"
              >
                <div className="relative overflow-hidden shrink-0">
                  {moreTopStoriesData.featuredStory.hero_image ? (
                    <img
                      src={getCardImageUrl(moreTopStoriesData.featuredStory.hero_image, moreTopStoriesData.featuredStory.hero_focus)}
                      alt={moreTopStoriesData.featuredStory.title}
                      className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      style={{
                        ...getImagePresentation(moreTopStoriesData.featuredStory.hero_focus, moreTopStoriesData.featuredStory.hero_crop),
                        aspectRatio: "4/3"
                      }}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="flex w-full items-center justify-center bg-neutral-950 text-[10px] uppercase tracking-widest text-neutral-600" style={{ aspectRatio: "4/3" }}>
                      No image
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-start p-4">
                  {(moreTopStoriesData.featuredStory.hero_caption || moreTopStoriesData.featuredStory.image_caption || moreTopStoriesData.featuredStory.photo_credit) ? (
                    <p className="mb-2 text-xs italic text-neutral-400">
                      {moreTopStoriesData.featuredStory.hero_caption || moreTopStoriesData.featuredStory.image_caption || moreTopStoriesData.featuredStory.photo_credit}
                    </p>
                  ) : null}
                  <h3
                    className="font-serif font-bold text-lg sm:text-xl text-white group-hover:underline leading-snug"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}
                  >
                    {moreTopStoriesData.featuredStory.title}
                  </h3>
                </div>
              </Link>
            </div>

            {/* Middle Column (Text-only headline list) — roughly 38% width */}
            <div className="flex flex-col">
              <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-transparent select-none hidden md:block">
                Spacer
              </div>
              <div className="h-px bg-neutral-800 mb-4 hidden md:block" />

              <div className="flex flex-col justify-between h-full divide-y divide-neutral-800">
                {moreTopStoriesData.headlineList.map((article, idx) => (
                  <div key={article.slug} className={`py-3.5 ${idx === 0 ? "pt-0" : ""} ${idx === moreTopStoriesData.headlineList.length - 1 ? "pb-0" : ""}`}>
                    <Link to={`/article/${article.slug}`} className="group block">
                      <h3
                        className="font-serif font-bold text-base sm:text-lg text-white group-hover:underline leading-snug"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}
                      >
                        {article.title}
                      </h3>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column ("Most Read" list) — roughly 22% width */}
            <div className="flex flex-col">
              <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                Most Read
              </div>
              <div className="h-px bg-neutral-800 mb-4" />

              <div className="flex flex-col divide-y divide-neutral-800">
                {moreTopStoriesData.mostReadList.map((article, index) => {
                  const isExclusive = article.is_exclusive || article.exclusive;
                  return (
                    <div key={article.slug} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                      <span className="font-sans font-bold text-[22px] text-neutral-400 select-none leading-none shrink-0 w-6 text-right">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <Link to={`/article/${article.slug}`} className="group block">
                          <h4
                            className="font-sans text-[13px] sm:text-[14px] font-semibold text-white group-hover:underline leading-snug"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden"
                            }}
                          >
                            {isExclusive ? (
                              <span className="inline-flex items-center bg-black text-white border border-neutral-700 font-sans text-[9px] font-extrabold tracking-wider px-1.5 py-0.5 rounded-full mr-1.5 uppercase select-none align-middle">
                                EXCLUSIVE
                              </span>
                            ) : null}
                            {article.title}
                          </h4>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </section>
      )}

      {forcedCategory.toLowerCase() === "politics" && <ElectionResultsSection />}
      {homepageSubcategorySections.length > 0 ? (
        <section className="mx-auto max-w-7xl px-3 pb-10 sm:px-4">
          <div className="space-y-6">
            {homepageSubcategorySections.map((section) => (
              <div key={section.slug} className="rounded-md border border-neutral-800 bg-neutral-950 p-3.5 sm:p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.28em] text-neutral-400">
                      {section.category}
                    </div>
                    <h2 className="mt-1.5 font-serif text-xl text-white sm:text-2xl">{section.name}</h2>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr),minmax(0,1fr)]">
                  <Link
                    to={`/article/${section.leadArticle.slug}`}
                    className="group overflow-hidden rounded-md border border-neutral-800 bg-neutral-900"
                  >
                    {section.leadArticle.hero_image ? (
                      <img
                        src={getHeroImageUrl(section.leadArticle.hero_image, section.leadArticle.hero_focus)}
                        alt={section.leadArticle.title}
                        className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] sm:h-72"
                        style={getImagePresentation(section.leadArticle.hero_focus, section.leadArticle.hero_crop)}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : null}

                    <div className="p-4 sm:p-5">
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--veritas-red)]">
                        {section.leadArticle.category}
                      </div>
                      <h3 className="mt-3 font-serif text-2xl leading-tight text-white group-hover:underline sm:text-[2rem]">
                        {section.leadArticle.title}
                      </h3>
                      <p className="mt-3 text-sm leading-[1.7] text-neutral-300">
                        {section.leadArticle.subheadline || section.leadArticle.paragraphs?.[0]?.slice(0, 160)}
                      </p>
                    </div>
                  </Link>

                  <div className="grid gap-3">
                    {section.supportingArticles.map((article) => (
                      <Link
                        key={article.id}
                        to={`/article/${article.slug}`}
                        className="grid min-h-[108px] grid-cols-[84px,1fr] gap-3 rounded-md border border-neutral-800 bg-neutral-900 p-2.5 transition-colors hover:border-neutral-700"
                      >
                        <div className="overflow-hidden rounded bg-neutral-950">
                          {article.hero_image ? (
                            <img
                              src={getCardImageUrl(article.hero_image, article.hero_focus)}
                              alt={article.title}
                              className="h-full w-full object-cover"
                              style={getImagePresentation(article.hero_focus, article.hero_crop)}
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div className="flex h-full min-h-[92px] items-center justify-center bg-neutral-950 text-[10px] uppercase tracking-[0.24em] text-neutral-600">
                              No Image
                            </div>
                          )}
                        </div>

                        <div className="flex min-w-0 flex-col justify-between">
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--veritas-red)]">
                              {article.category}
                            </div>
                            <h4
                              className="mt-2 text-base font-semibold leading-snug text-white hover:underline"
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden"
                              }}
                            >
                              {article.title}
                            </h4>
                            <p
                              className="mt-2 text-sm leading-[1.55] text-neutral-400"
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden"
                              }}
                            >
                              {article.subheadline || article.paragraphs?.[0]?.slice(0, 88)}
                            </p>
                          </div>

                          <div className="mt-3 text-xs text-neutral-500">{getArticleDisplayTime(article)}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <Link
                    to={section.categoryPath}
                    className="inline-flex items-center rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/30 hover:bg-white/5"
                  >
                    More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

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