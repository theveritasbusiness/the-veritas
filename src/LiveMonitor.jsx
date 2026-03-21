import React from "react";
import { Link } from "react-router-dom";

const monitorCards = [
  {
    label: "Global Watch",
    title: "Geopolitics, conflict and breaking movement",
    body: "A dedicated live desk for flashpoints, strategic posture, and the stories changing the international order."
  },
  {
    label: "Signals",
    title: "Alerts, escalation patterns and rolling updates",
    body: "Surface live developments faster with a monitor-first layout designed for constant scanning and rapid context switching."
  },
  {
    label: "Veritas Style",
    title: "Built in our voice, not bolted on",
    body: "The monitor will carry The Veritas visual identity, editorial priorities, and navigation flow from day one."
  }
];

export default function LiveMonitor() {
  return (
    <div className="min-h-screen bg-black text-white px-3 sm:px-4 py-6 sm:py-10">
      <div className="max-w-6xl mx-auto">
        <section className="rounded-[28px] border border-neutral-800 bg-[radial-gradient(circle_at_top,#340208_0%,#151515_34%,#050505_78%)] overflow-hidden">
          <div className="px-5 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
            <div
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs sm:text-sm uppercase tracking-[0.28em]"
              style={{ borderColor: "rgba(222,2,22,0.5)", color: "var(--veritas-red)" }}
            >
              <span className="h-2.5 w-2.5 rounded-full live-pulse" />
              Veritas Live
            </div>

            <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr,0.8fr] lg:items-end">
              <div className="min-w-0">
                <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight">
                  The Veritas
                  <br />
                  Live Monitor
                </h1>

                <p className="mt-5 max-w-2xl text-neutral-300 text-base sm:text-lg leading-relaxed">
                  A live intelligence and breaking-news command surface for The Veritas.
                  This is the new entry point for real-time monitoring, rapid updates, and
                  high-attention global tracking.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
                  <button
                    className="px-6 py-3 rounded-full text-sm font-semibold text-black live-button"
                    style={{ backgroundColor: "var(--veritas-red)" }}
                  >
                    Live Build In Progress
                  </button>
                  <Link
                    to="/"
                    className="px-6 py-3 rounded-full border border-neutral-700 text-sm font-medium text-neutral-200 hover:border-neutral-500 transition-colors text-center"
                  >
                    Return To Homepage
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-neutral-400">
                    Status
                  </div>
                  <div className="mt-2 text-2xl font-semibold">Phase 1</div>
                  <div className="mt-1 text-sm text-neutral-400">
                    Entry point and branding shell now live
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-neutral-400">
                    Direction
                  </div>
                  <div className="mt-2 text-2xl font-semibold">Monitor-First</div>
                  <div className="mt-1 text-sm text-neutral-400">
                    Built for scanning, alerts, and constant updates
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-neutral-400">
                    Brand
                  </div>
                  <div className="mt-2 text-2xl font-semibold">Veritas</div>
                  <div className="mt-1 text-sm text-neutral-400">
                    Aligned with the new accent system and masthead
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 sm:mt-8 grid gap-4 lg:grid-cols-3">
          {monitorCards.map((card) => (
            <article
              key={card.title}
              className="rounded-2xl border border-neutral-800 bg-neutral-950/90 px-5 py-5"
            >
              <div
                className="text-xs uppercase tracking-[0.24em]"
                style={{ color: "var(--veritas-red)" }}
              >
                {card.label}
              </div>
              <h2 className="mt-3 text-xl font-semibold leading-snug">{card.title}</h2>
              <p className="mt-3 text-sm sm:text-base text-neutral-400 leading-relaxed">
                {card.body}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-6 sm:mt-8 rounded-2xl border border-neutral-800 bg-neutral-950 px-5 py-6 sm:px-6 sm:py-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="text-sm uppercase tracking-[0.24em] text-neutral-400">
                Next Build Layers
              </div>
              <p className="mt-2 text-neutral-300 max-w-3xl leading-relaxed">
                Next we can wire in the real monitor stack behind this page: the live desk layout,
                map surfaces, data panels, country/event tracking, and deeper live workflows.
              </p>
            </div>
            <div
              className="rounded-full border px-4 py-2 text-sm font-medium self-start lg:self-auto"
              style={{ borderColor: "rgba(222,2,22,0.5)", color: "var(--veritas-red)" }}
            >
              Ready For Full Integration
            </div>
          </div>
        </section>

        <style>{`
.live-button {
  box-shadow: 0 0 0 1px rgba(222, 2, 22, 0.35), 0 0 30px rgba(222, 2, 22, 0.25);
}

.live-pulse {
  background: var(--veritas-red);
  box-shadow: 0 0 0 rgba(222, 2, 22, 0.8);
  animation: livePulse 1.8s infinite;
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
        `}</style>
      </div>
    </div>
  );
}
