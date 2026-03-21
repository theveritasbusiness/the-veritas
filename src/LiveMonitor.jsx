import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchArticles, fetchBreaking } from "./api";

function formatAge(article) {
  if (article?.published_ago) {
    const hours = article.published_ago.hours || 0;
    const minutes = article.published_ago.minutes || 0;
    return `${hours}h ${minutes}m ago`;
  }

  return "Recently";
}

function formatClock(date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short"
  }).format(date);
}

export default function LiveMonitor() {
  const [articles, setArticles] = useState([]);
  const [breaking, setBreaking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [allArticles, breakingArticles] = await Promise.all([
          fetchArticles(),
          fetchBreaking()
        ]);

        if (cancelled) return;

        setArticles(allArticles);
        setBreaking(breakingArticles);
        setError("");
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "Failed to load monitor");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();
    const refresh = window.setInterval(loadData, 120000);

    return () => {
      cancelled = true;
      window.clearInterval(refresh);
    };
  }, []);

  const topStory = articles[0] || null;
  const latestStories = articles.slice(0, 8);
  const conflictWatch = useMemo(
    () =>
      articles.filter((article) =>
        ["geopolitics", "politics", "india", "legal", "sports", "trending"].includes(
          (article.category || "").toLowerCase()
        )
      ),
    [articles]
  );
  const spotlightStories = conflictWatch.slice(0, 4);
  const monitorCounts = useMemo(
    () => [
      { label: "Live Stories", value: String(articles.length || 0).padStart(2, "0") },
      { label: "Breaking Items", value: String(breaking.length || 0).padStart(2, "0") },
      {
        label: "Tracked Categories",
        value: String(new Set(articles.map((item) => item.category).filter(Boolean)).size).padStart(2, "0")
      }
    ],
    [articles, breaking]
  );

  return (
    <div className="min-h-screen bg-black text-white px-3 sm:px-4 py-5 sm:py-8">
      <div className="max-w-7xl mx-auto">
        <section className="rounded-[28px] border border-neutral-800 bg-[radial-gradient(circle_at_top,#340208_0%,#161616_34%,#040404_78%)] overflow-hidden">
          <div className="px-5 py-7 sm:px-8 sm:py-10 xl:px-10">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0 max-w-4xl">
                <div
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs sm:text-sm uppercase tracking-[0.28em]"
                  style={{ borderColor: "rgba(222,2,22,0.45)", color: "var(--veritas-red)" }}
                >
                  <span className="h-2.5 w-2.5 rounded-full live-pulse" />
                  The Veritas Live
                </div>

                <h1 className="mt-5 font-serif text-5xl sm:text-6xl xl:text-7xl leading-[0.92] tracking-tight">
                  Global Monitor
                  <br />
                  Live Desk
                </h1>

                <p className="mt-4 max-w-3xl text-neutral-300 text-base sm:text-lg leading-relaxed">
                  A live command surface for breaking stories, strategic movement, and
                  high-attention developments across The Veritas network.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 xl:w-[520px]">
                {monitorCounts.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur px-4 py-4"
                  >
                    <div className="text-xs uppercase tracking-[0.24em] text-neutral-400">
                      {item.label}
                    </div>
                    <div className="mt-2 text-3xl font-semibold">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span
                  className="rounded-full border px-4 py-2 font-medium"
                  style={{ borderColor: "rgba(222,2,22,0.45)", color: "var(--veritas-red)" }}
                >
                  {loading ? "Syncing feed..." : "Feed active"}
                </span>
                <span className="rounded-full border border-neutral-700 px-4 py-2 text-neutral-300">
                  {formatClock(now)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/"
                  className="px-5 py-3 rounded-full border border-neutral-700 text-sm font-medium text-neutral-200 hover:border-neutral-500 transition-colors text-center"
                >
                  Back To Homepage
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-4 overflow-hidden">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div
              className="text-xs sm:text-sm uppercase tracking-[0.24em] shrink-0"
              style={{ color: "var(--veritas-red)" }}
            >
              Breaking Feed
            </div>
            <div className="overflow-hidden whitespace-nowrap flex-1 text-sm sm:text-base text-neutral-200">
              <div className="live-ticker">
                {(breaking.length ? breaking : articles.slice(0, 6))
                  .map((item) => item.title)
                  .join("  |  ")}
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div
            className="mt-5 rounded-2xl border px-4 py-4 text-sm"
            style={{ borderColor: "rgba(222,2,22,0.45)", color: "var(--veritas-red)" }}
          >
            {error}
          </div>
        )}

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.15fr,0.85fr]">
          <div className="space-y-5 min-w-0">
            <article className="rounded-[26px] border border-neutral-800 bg-neutral-950 overflow-hidden">
              <div className="grid lg:grid-cols-[1.15fr,0.85fr]">
                <div className="p-5 sm:p-6 xl:p-7 min-w-0">
                  <div
                    className="text-xs uppercase tracking-[0.24em]"
                    style={{ color: "var(--veritas-red)" }}
                  >
                    Lead Story
                  </div>

                  <h2 className="mt-3 font-serif text-4xl sm:text-5xl leading-[0.98] break-words">
                    {topStory?.title || "Live desk warming up"}
                  </h2>

                  <p className="mt-4 text-neutral-300 text-base sm:text-lg leading-relaxed max-w-2xl">
                    {topStory?.subheadline ||
                      topStory?.paragraphs?.[0]?.slice(0, 200) ||
                      "The Veritas Live Monitor will surface the most important stories here as the feed syncs."}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-neutral-400">
                    <span>{topStory?.category || "Monitor"}</span>
                    <span>•</span>
                    <span>{formatAge(topStory)}</span>
                  </div>

                  {topStory?.slug && (
                    <Link
                      to={`/article/${topStory.slug}`}
                      className="inline-flex mt-6 rounded-full px-5 py-3 text-sm font-semibold text-black"
                      style={{ backgroundColor: "var(--veritas-red)" }}
                    >
                      Open Story
                    </Link>
                  )}
                </div>

                <div className="min-h-[280px] lg:min-h-full">
                  {topStory?.hero_image ? (
                    <img
                      src={topStory.hero_image}
                      alt={topStory.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-neutral-900 flex items-center justify-center text-neutral-500">
                      Veritas Live Visual Layer
                    </div>
                  )}
                </div>
              </div>
            </article>

            <div className="grid gap-5 lg:grid-cols-2">
              <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-serif text-2xl">Live Queue</h3>
                  <span
                    className="text-xs uppercase tracking-[0.24em]"
                    style={{ color: "var(--veritas-red)" }}
                  >
                    Updated
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  {latestStories.map((story, index) => (
                    <Link
                      key={story.id}
                      to={`/article/${story.slug}`}
                      className="flex items-start gap-4 rounded-xl border border-neutral-800 bg-black/30 px-4 py-4 hover:border-neutral-600 transition-colors"
                    >
                      <div
                        className="text-sm font-semibold shrink-0"
                        style={{ color: "var(--veritas-red)" }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm text-neutral-400">{story.category || "Monitor"}</div>
                        <div className="mt-1 font-medium leading-snug break-words">{story.title}</div>
                        <div className="mt-2 text-xs text-neutral-500">{formatAge(story)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-serif text-2xl">Strategic Watch</h3>
                  <span
                    className="text-xs uppercase tracking-[0.24em]"
                    style={{ color: "var(--veritas-red)" }}
                  >
                    Focus
                  </span>
                </div>

                <div className="mt-5 grid gap-3">
                  {spotlightStories.map((story) => (
                    <div
                      key={story.id}
                      className="rounded-xl border border-neutral-800 bg-black/30 px-4 py-4"
                    >
                      <div
                        className="text-xs uppercase tracking-[0.22em]"
                        style={{ color: "var(--veritas-red)" }}
                      >
                        {story.category || "Monitor"}
                      </div>
                      <div className="mt-2 text-lg font-semibold leading-snug break-words">
                        {story.title}
                      </div>
                      <div className="mt-2 text-sm text-neutral-400">
                        {story.subheadline || story.paragraphs?.[0]?.slice(0, 100) || "No summary yet."}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <aside className="space-y-5 min-w-0">
            <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-serif text-2xl">Command Layer</h3>
                <span
                  className="text-xs uppercase tracking-[0.24em]"
                  style={{ color: "var(--veritas-red)" }}
                >
                  Phase 2
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-xl border border-neutral-800 bg-black/30 px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-neutral-400">
                    Monitor Map
                  </div>
                  <div className="mt-2 text-xl font-semibold">Next Layer</div>
                  <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                    The next integration step is bringing in live map and world-state surfaces behind this desk.
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-black/30 px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-neutral-400">
                    Live Signals
                  </div>
                  <div className="mt-2 text-xl font-semibold">Panels Ready</div>
                  <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                    This route is now structured to host richer monitor panels without changing the rest of the site.
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-black/30 px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-neutral-400">
                    Veritas Layer
                  </div>
                  <div className="mt-2 text-xl font-semibold">Brand Locked</div>
                  <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                    Accent, framing, spacing and CTA treatment are already aligned with The Veritas styling system.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 sm:p-6">
              <h3 className="font-serif text-2xl">Breaking Board</h3>
              <div className="mt-5 space-y-3">
                {(breaking.length ? breaking : latestStories.slice(0, 5)).map((story) => (
                  <Link
                    key={story.id}
                    to={`/article/${story.slug}`}
                    className="block rounded-xl border border-neutral-800 bg-black/30 px-4 py-4 hover:border-neutral-600 transition-colors"
                  >
                    <div
                      className="text-xs uppercase tracking-[0.22em]"
                      style={{ color: "var(--veritas-red)" }}
                    >
                      Breaking
                    </div>
                    <div className="mt-2 font-medium leading-snug break-words">{story.title}</div>
                  </Link>
                ))}
              </div>
            </section>
          </aside>
        </section>

        <style>{`
.live-pulse {
  background: var(--veritas-red);
  box-shadow: 0 0 0 rgba(222, 2, 22, 0.8);
  animation: livePulse 1.8s infinite;
}

.live-ticker {
  display: inline-block;
  padding-left: 100%;
  animation: liveTicker 24s linear infinite;
}

@keyframes livePulse {
  0% {
    box-shadow: 0 0 0 0 rgba(222, 2, 22, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(222, 2, 22, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(222, 2, 22, 0);
  }
}

@keyframes liveTicker {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}
        `}</style>
      </div>
    </div>
  );
}
