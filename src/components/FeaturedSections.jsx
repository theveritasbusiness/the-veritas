import React, { useEffect, useRef, useState } from "react";
import { Link } from "../lib/router";
import { getCardImageUrl, getImagePresentation } from "../utils/cloudinary";

const HEADING = "THE WORLD KEPT SPINNING";
const COPIES = 3;

// Featured sections rail above the footer: one column per other category,
// four visible on desktop, scrolling endlessly in both directions.
export default function FeaturedSections({ sections = [] }) {
  const trackRef = useRef(null);
  // Section order is shuffled per visit. The server renders the fixed order and
  // the shuffle runs after hydration so the markup still matches.
  const [ordered, setOrdered] = useState(sections);
  const loops = ordered.length > 1;
  // Endless scroll: the columns render three times and the view is kept inside
  // the middle copy; drifting into an outer copy jumps back by one copy width,
  // which is invisible because the copies are identical.
  const columns = loops ? Array.from({ length: COPIES }, () => ordered).flat() : ordered;

  useEffect(() => {
    const shuffled = [...sections];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setOrdered(shuffled);
  }, [sections]);

  // Instantly shifts the view by whole copies. Snapping is switched off for the
  // jump, otherwise the browser animates a re-snap and the rail visibly stutters.
  function jumpTo(track, left) {
    track.style.scrollSnapType = "none";
    track.scrollLeft = left;
    requestAnimationFrame(() => {
      track.style.scrollSnapType = "";
    });
  }

  function recenter(track) {
    const width = track.scrollWidth / COPIES;
    if (track.scrollLeft < width * 0.5) jumpTo(track, track.scrollLeft + width);
    else if (track.scrollLeft > width * 1.5) jumpTo(track, track.scrollLeft - width);
  }

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !loops) return undefined;

    jumpTo(track, track.scrollWidth / COPIES);

    // Recentre only once scrolling has fully stopped, so a swipe or a smooth
    // arrow scroll is never interrupted. scrollend where supported, else a timer.
    const hasScrollEnd = "onscrollend" in window;
    let timer = null;
    const onScrollEnd = () => recenter(track);
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(onScrollEnd, 180);
    };
    const onResize = () => jumpTo(track, track.scrollWidth / COPIES);

    if (hasScrollEnd) track.addEventListener("scrollend", onScrollEnd);
    else track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(timer);
      track.removeEventListener("scrollend", onScrollEnd);
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [ordered, loops]);

  if (sections.length === 0) return null;

  function scrollByPage(direction) {
    const track = trackRef.current;
    if (!track) return;
    // Re-centre first (invisible while idle) so the smooth scroll itself never
    // needs a correction afterwards.
    if (loops) recenter(track);
    track.scrollBy({ left: direction * track.clientWidth, behavior: "smooth" });
  }

  const arrowClass =
    "absolute top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/55 text-lg text-white transition hover:border-[var(--veritas-red)] hover:text-[var(--veritas-red)]";

  return (
    <section className="mx-auto max-w-7xl px-3 py-8 sm:px-4 sm:py-10" aria-label={HEADING}>
      <div className="mb-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
        <h2 className="text-center font-serif text-xl font-bold leading-tight tracking-tight text-white sm:whitespace-nowrap sm:text-3xl">
          {HEADING}
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
      </div>

      <div className="relative">
        {loops ? (
          <>
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-black to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-black to-transparent" />
            <button
              type="button"
              className={`${arrowClass} left-1`}
              onClick={() => scrollByPage(-1)}
              aria-label="Previous sections"
            >
              &#8249;
            </button>
            <button
              type="button"
              className={`${arrowClass} right-1`}
              onClick={() => scrollByPage(1)}
              aria-label="Next sections"
            >
              &#8250;
            </button>
          </>
        ) : null}

        <div ref={trackRef} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto">
          {columns.map((section, index) => {
            // Only the middle copy is exposed to screen readers and keyboard focus.
            const isClone = loops && Math.floor(index / ordered.length) !== 1;

            return (
              <div
                key={`${index}-${section.slug}`}
                aria-hidden={isClone || undefined}
                className="w-[85%] flex-shrink-0 snap-start border-l border-neutral-800 px-5 sm:w-1/2 lg:w-1/4"
              >
                <Link
                  to={`/${section.slug}`}
                  tabIndex={isClone ? -1 : undefined}
                  className="group mb-2 inline-flex items-center gap-2 font-serif text-xl font-bold text-[var(--veritas-red)] transition-colors hover:text-white"
                >
                  {section.name}
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                    &rarr;
                  </span>
                </Link>

                <div className="divide-y divide-neutral-800">
                  {section.articles.map((article) => (
                    <Link
                      key={article.id || article.slug}
                      to={`/article/${article.slug}`}
                      tabIndex={isClone ? -1 : undefined}
                      className="group flex items-start gap-3 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--veritas-red)]">
                          {article.label}
                        </div>
                        <h3 className="mt-1 line-clamp-3 font-serif text-[1.02rem] leading-snug text-white transition-colors group-hover:text-[var(--veritas-red)]">
                          {article.title}
                        </h3>
                      </div>
                      <div className="h-20 w-24 flex-shrink-0 overflow-hidden rounded-md border border-neutral-800 bg-neutral-950">
                        {article.hero_image ? (
                          <img
                            src={getCardImageUrl(article.hero_image, article.hero_focus)}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            style={getImagePresentation(article.hero_focus, article.hero_crop)}
                            loading="lazy"
                            decoding="async"
                          />
                        ) : null}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
