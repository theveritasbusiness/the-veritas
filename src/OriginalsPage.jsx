import React, { useEffect, useState } from "react";
import { fetchOriginals } from "./api";
import Seo from "./components/Seo";
import YouTubeEmbed from "./components/YouTubeEmbed";

export default function OriginalsPage({ initialOriginals }) {
  const [originals, setOriginals] = useState(Array.isArray(initialOriginals) ? initialOriginals : []);
  const [loading, setLoading] = useState(!Array.isArray(initialOriginals));
  const [error, setError] = useState("");

  useEffect(() => {
    if (Array.isArray(initialOriginals)) {
      setOriginals(initialOriginals);
      setLoading(false);
      return undefined;
    }

    let active = true;
    fetchOriginals()
      .then((data) => {
        if (active) setOriginals(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (active && !/404|not found|cannot get/i.test(err.message || "")) {
          setError(err.message || "Unable to load Originals.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [initialOriginals]);

  return (
    <main className="mx-auto min-h-[62vh] w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Seo
        title="The Veritas Originals"
        description="Original reporting and video features from The Veritas."
        path="/originals"
        canonical="https://www.theveritas.in/originals"
      />

      <header className="border-b border-white/10 pb-6 sm:pb-8">
        <div className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.28em] text-white">
          The Veritas <span className="inline-block h-0 w-0 border-y-[10px] border-l-[15px] border-y-transparent border-l-[var(--veritas-red)]" />
        </div>
        <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-white sm:text-6xl">Originals</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-400 sm:text-lg">Ground reporting, documentaries, and original video journalism from The Veritas.</p>
      </header>

      {loading ? <div className="py-16 text-neutral-400">Loading Originals...</div> : null}
      {error ? <div className="py-16 text-red-300">{error}</div> : null}
      {!loading && !error && originals.length === 0 ? <div className="py-16 text-neutral-400">No Originals have been published yet.</div> : null}

      <section className="divide-y divide-white/10">
        {originals.map((original) => (
          <article key={original.id} className="grid gap-6 py-8 sm:py-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:items-center">
            <YouTubeEmbed videoId={original.youtube_video_id} url={original.youtube_url} title={original.title} />
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--veritas-red)]">The Veritas Original</div>
              <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-white sm:text-4xl">{original.title}</h2>
              <p className="mt-4 whitespace-pre-line text-base leading-7 text-neutral-300">{original.description}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
