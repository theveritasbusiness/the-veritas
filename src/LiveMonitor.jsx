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

const regionBlueprint = [
  { region: "North Atlantic", x: "28%", y: "26%", city: "London" },
  { region: "South Asia", x: "63%", y: "48%", city: "New Delhi" },
  { region: "East Asia", x: "78%", y: "34%", city: "Singapore" },
  { region: "Middle East", x: "58%", y: "38%", city: "Dubai" },
  { region: "North America", x: "16%", y: "33%", city: "Washington" },
  { region: "Eastern Europe", x: "51%", y: "24%", city: "Warsaw" }
];

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
  const spotlightStories = articles.slice(0, 4);
  const watchlistStories = articles.slice(4, 10);
  const breakingBoard = breaking.length ? breaking : latestStories.slice(0, 5);

  const categoryMatrix = useMemo(() => {
    const counts = new Map();
    for (const article of articles) {
      const category = article.category || "Unsorted";
      counts.set(category, (counts.get(category) || 0) + 1);
    }

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, count], index) => ({
        label,
        count,
        priority: ["Critical", "Elevated", "Active", "Watching", "Scanning", "Queued"][index] || "Watching"
      }));
  }, [articles]);

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

  const regionalSignals = useMemo(
    () =>
      regionBlueprint.map((region, index) => {
        const story = articles[index] || topStory;
        return {
          ...region,
          title: story?.title || "Awaiting signal",
          category: story?.category || "Monitor",
          age: formatAge(story)
        };
      }),
    [articles, topStory]
  );

  const liveChannels = useMemo(
    () => [
      { title: "Desk Feed", subtitle: "Editorial priority stream", value: `${latestStories.length} active` },
      { title: "Breaking Layer", subtitle: "High-attention developments", value: `${breaking.length || 0} active` },
      { title: "Signal Matrix", subtitle: "Category density and alerts", value: `${categoryMatrix.length} live` },
      { title: "Regional Watch", subtitle: "Geo-priority checkpoints", value: `${regionalSignals.length} nodes` }
    ],
    [latestStories.length, breaking.length, categoryMatrix.length, regionalSignals.length]
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
                  Trending Desk
                </div>

                <h1 className="mt-5 font-serif text-5xl sm:text-6xl xl:text-7xl leading-[0.92] tracking-tight">
                  The Veritas
                  <br />
                  Trending Wire
                </h1>

                <p className="mt-4 max-w-3xl text-neutral-300 text-base sm:text-lg leading-relaxed">
                  A live article-tracking surface for the stories rising fastest across The
                  Veritas network, with breaking movement, category density, and regional watch
                  points in one command view.
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

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.08fr,0.92fr]">
          <div className="space-y-5 min-w-0">
            <article className="rounded-[26px] border border-neutral-800 bg-neutral-950 overflow-hidden">
              <div className="grid lg:grid-cols-[1.08fr,0.92fr]">
                <div className="p-5 sm:p-6 xl:p-7 min-w-0">
                  <div
                    className="text-xs uppercase tracking-[0.24em]"
                    style={{ color: "var(--veritas-red)" }}
                  >
                    Trending Lead
                  </div>

                  <h2 className="mt-3 font-serif text-4xl sm:text-5xl leading-[0.98] break-words">
                    {topStory?.title || "Live desk warming up"}
                  </h2>

                  <p className="mt-4 text-neutral-300 text-base sm:text-lg leading-relaxed max-w-2xl">
                    {topStory?.subheadline ||
                      topStory?.paragraphs?.[0]?.slice(0, 200) ||
                      "The Veritas trending desk surfaces the most important stories here as the live article feed syncs."}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-neutral-400">
                    <span>{topStory?.category || "Monitor"}</span>
                    <span>|</span>
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

            <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-serif text-2xl">Operations Map</h3>
                <span
                  className="text-xs uppercase tracking-[0.24em]"
                  style={{ color: "var(--veritas-red)" }}
                >
                  Regional Grid
                </span>
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-[1.08fr,0.92fr]">
                <div className="relative min-h-[360px] rounded-[24px] border border-neutral-800 overflow-hidden ops-map">
                  <div className="absolute inset-0 ops-grid" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(222,2,22,0.08),transparent_55%)]" />

                  {regionalSignals.map((signal) => (
                    <div
                      key={`${signal.region}-${signal.city}`}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ left: signal.x, top: signal.y }}
                    >
                      <div className="ops-node" />
                      <div className="mt-3 w-44 rounded-xl border border-neutral-800 bg-black/85 backdrop-blur px-3 py-3">
                        <div
                          className="text-[11px] uppercase tracking-[0.2em]"
                          style={{ color: "var(--veritas-red)" }}
                        >
                          {signal.city}
                        </div>
                        <div className="mt-1 text-sm font-semibold leading-snug break-words">
                          {signal.title}
                        </div>
                        <div className="mt-2 text-[11px] text-neutral-400">
                          {signal.region} | {signal.category} | {signal.age}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 content-start">
                  {liveChannels.map((channel) => (
                    <div
                      key={channel.title}
                      className="rounded-xl border border-neutral-800 bg-black/30 px-4 py-4"
                    >
                      <div className="text-xs uppercase tracking-[0.24em] text-neutral-400">
                        {channel.title}
                      </div>
                      <div className="mt-2 text-xl font-semibold">{channel.value}</div>
                      <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                        {channel.subtitle}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

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
                  <h3 className="font-serif text-2xl">Signal Matrix</h3>
                  <span
                    className="text-xs uppercase tracking-[0.24em]"
                    style={{ color: "var(--veritas-red)" }}
                  >
                    Priority
                  </span>
                </div>

                <div className="mt-5 grid gap-3">
                  {categoryMatrix.map((signal) => (
                    <div
                      key={signal.label}
                      className="rounded-xl border border-neutral-800 bg-black/30 px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div
                            className="text-[11px] uppercase tracking-[0.2em]"
                            style={{ color: "var(--veritas-red)" }}
                          >
                            {signal.priority}
                          </div>
                          <div className="mt-1 text-lg font-semibold">{signal.label}</div>
                        </div>
                        <div className="text-3xl font-semibold text-white/90">
                          {String(signal.count).padStart(2, "0")}
                        </div>
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
                <h3 className="font-serif text-2xl">Spotlight Stack</h3>
                <span
                  className="text-xs uppercase tracking-[0.24em]"
                  style={{ color: "var(--veritas-red)" }}
                >
                  Focus
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                {spotlightStories.map((story) => (
                  <Link
                    key={story.id}
                    to={`/article/${story.slug}`}
                    className="rounded-xl border border-neutral-800 bg-black/30 px-4 py-4 hover:border-neutral-600 transition-colors"
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
                    <div className="mt-2 text-sm text-neutral-400 leading-relaxed">
                      {story.subheadline || story.paragraphs?.[0]?.slice(0, 110) || "No summary yet."}
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-serif text-2xl">Watchlist</h3>
                <span
                  className="text-xs uppercase tracking-[0.24em]"
                  style={{ color: "var(--veritas-red)" }}
                >
                  Queue
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {watchlistStories.map((story) => (
                  <div
                    key={story.id}
                    className="rounded-xl border border-neutral-800 bg-black/30 px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium leading-snug break-words">{story.title}</div>
                        <div className="mt-2 text-xs text-neutral-400">
                          {story.category || "Monitor"} | {formatAge(story)}
                        </div>
                      </div>
                      <div
                        className="text-[11px] uppercase tracking-[0.2em] shrink-0"
                        style={{ color: "var(--veritas-red)" }}
                      >
                        Watch
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 sm:p-6">
              <h3 className="font-serif text-2xl">Breaking Board</h3>
              <div className="mt-5 space-y-3">
                {breakingBoard.map((story) => (
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

.ops-map {
  background:
    radial-gradient(circle at center, rgba(222, 2, 22, 0.12), transparent 52%),
    linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0)),
    #080808;
}

.ops-grid {
  background-image:
    linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 44px 44px;
  opacity: 0.45;
}

.ops-node {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: var(--veritas-red);
  box-shadow: 0 0 0 6px rgba(222, 2, 22, 0.12), 0 0 24px rgba(222, 2, 22, 0.5);
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
