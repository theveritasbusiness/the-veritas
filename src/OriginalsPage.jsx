import React, { useEffect, useState } from "react";
import { Link } from "./lib/router";
import Seo from "./components/Seo";
import YouTubeEmbed from "./components/YouTubeEmbed";
import { fetchOriginals } from "./api";
import { formatPublishedDateTime } from "./utils/time";

const PAGE_DESCRIPTION =
  "The Veritas Original — ground reports, documentaries and video journalism produced by The Veritas newsroom.";

// The title links to the connected article when one is set in the CMS.
function OriginalTitle({ original }) {
  const slug = String(original?.article_slug || "").trim();

  if (!slug) {
    return <>{original?.title}</>;
  }

  return (
    <Link
      to={`/article/${slug}`}
      className="transition hover:text-[var(--veritas-red)]"
    >
      {original.title}
    </Link>
  );
}

export default function OriginalsPage({ initialOriginals = [], initialError = "" }) {
  const [originals, setOriginals] = useState(initialOriginals);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(initialOriginals.length === 0 && !initialError);

  useEffect(() => {
    let isMounted = true;

    async function loadOriginals() {
      try {
        const data = await fetchOriginals();
        if (!isMounted) return;

        setOriginals(Array.isArray(data) ? data : []);
        setError("");
      } catch (loadError) {
        // The server-rendered list, if there was one, stays on screen.
        if (isMounted && initialOriginals.length === 0) {
          setError(loadError.message || "Unable to load Originals");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadOriginals();
    return () => {
      isMounted = false;
    };
  }, [initialOriginals.length]);

  const [featured, ...rest] = originals;

  return (
    <div className="min-h-screen bg-black text-white">
      <Seo
        title="The Veritas Original"
        description={PAGE_DESCRIPTION}
        path="/originals"
        canonical="https://www.theveritas.in/originals"
      />

      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <header className="border-b border-white/10 pb-6">
          <div
            className="text-xs uppercase tracking-[0.24em]"
            style={{ color: "var(--veritas-red)" }}
          >
            The Veritas Original
          </div>
          <h1 className="mt-3">
            <img
              src="/originals-logo.png"
              alt="Originals"
              className="h-9 w-auto sm:h-12 lg:h-14"
              width={1434}
              height={161}
            />
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-neutral-400">
            Ground reports, documentaries and video journalism produced by The Veritas newsroom.
          </p>
        </header>

        {error ? (
          <div className="mt-10 text-sm" style={{ color: "var(--veritas-red)" }}>
            {error}
          </div>
        ) : null}

        {!error && loading && originals.length === 0 ? (
          <div className="mt-10 text-sm text-neutral-500">Loading Originals...</div>
        ) : null}

        {!error && !loading && originals.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-neutral-800 px-6 py-10 text-sm text-neutral-500">
            The first Veritas Original is on its way.
          </div>
        ) : null}

        {featured ? (
          <section className="mt-10">
            <div className="grid gap-8 lg:grid-cols-[1.35fr,1fr] lg:items-start">
              <div className="rounded-[20px] border border-[rgba(222,2,22,0.7)] p-2">
                <YouTubeEmbed url={featured.youtube_url} title={featured.title} />
              </div>

              <div className="min-w-0">
                <h2 className="font-serif text-2xl font-bold leading-tight sm:text-3xl lg:text-[2.25rem]">
                  <OriginalTitle original={featured} />
                </h2>
                <div className="my-4 w-16 border-b" style={{ borderColor: "var(--veritas-red)" }} />
                {featured.description ? (
                  <p className="whitespace-pre-line font-serif text-[17px] leading-[1.9] text-neutral-300">
                    {featured.description}
                  </p>
                ) : null}
                {featured.created_at ? (
                  <div className="mt-5 text-sm text-neutral-500">
                    {formatPublishedDateTime(featured.created_at)}
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {rest.length > 0 ? (
          <section className="mt-14">
            <h2 className="mb-6 border-b border-white/10 pb-3 font-serif text-2xl">
              More Originals
            </h2>

            <div className="grid gap-8 md:grid-cols-2">
              {rest.map((original) => (
                <article key={original.id} className="min-w-0">
                  <YouTubeEmbed url={original.youtube_url} title={original.title} />
                  <h3 className="mt-4 font-serif text-xl font-bold leading-snug">
                    <OriginalTitle original={original} />
                  </h3>
                  {original.description ? (
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-neutral-400">
                      {original.description}
                    </p>
                  ) : null}
                  {original.created_at ? (
                    <div className="mt-3 text-xs text-neutral-500">
                      {formatPublishedDateTime(original.created_at)}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
