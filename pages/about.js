import Layout from "../src/components/Layout";
import Seo from "../src/components/Seo";
import { Link } from "../src/lib/router";
import { API_BASE } from "../src/lib/env";
import { collectAuthorProfiles } from "../src/content/authors";

function TeamAvatar({ profile }) {
  if (profile.image) {
    return (
      <img
        src={profile.image}
        alt={profile.name}
        className="h-20 w-20 rounded-2xl object-cover"
      />
    );
  }

  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-neutral-900 text-2xl font-semibold text-white">
      {profile.initials}
    </div>
  );
}

function StatCard({ label, value, copy }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-neutral-950 p-5">
      <div className="text-xs uppercase tracking-[0.24em] text-neutral-500">{label}</div>
      <div className="mt-4 font-serif text-3xl text-white">{value}</div>
      <p className="mt-3 text-sm leading-7 text-neutral-400">{copy}</p>
    </div>
  );
}

export default function AboutPage({ authors = [], articleCount = 0 }) {
  return (
    <Layout>
      <Seo
        title="About Us"
        description="The Veritas is a fearless voice for truth and justice, practicing unbiased, fact-checked, and responsible journalism."
        path="/about"
      />

      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <section className="overflow-hidden rounded-[34px] border border-neutral-800 bg-[radial-gradient(circle_at_top,#2a0408_0%,#0d0d0d_42%,#030303_80%)]">
            <div className="px-6 py-10 sm:px-8 lg:px-12 lg:py-14">
              <img
                src="/Logo_Edit_4.png"
                alt="The Veritas"
                className="h-16 w-auto object-contain sm:h-20"
              />

              <div
                className="mt-8 inline-flex items-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em]"
                style={{ borderColor: "rgba(222,2,22,0.45)", color: "var(--veritas-red)" }}
              >
                About Us
              </div>

              <div className="mt-6 grid gap-10 lg:grid-cols-[1.2fr,0.8fr] lg:items-end">
                <div>
                  <h1 className="font-serif text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">
                    The Veritas
                  </h1>
                  <p className="mt-4 text-xl text-neutral-300 sm:text-2xl">
                    Where truth speaks itself.
                  </p>

                  <div className="mt-8 max-w-3xl space-y-5 text-lg leading-9 text-neutral-200">
                    <p>
                      The Veritas is a fearless voice for truth and justice. In an age of
                      misinformation, we practice unbiased, fact-checked, and responsible
                      journalism.
                    </p>
                    <p>
                      We uncover hidden realities, amplify marginalized voices, and hold power to
                      account, going beyond headlines to report stories that truly impact society.
                    </p>
                    <p>
                      The Veritas is not just a media house; it is a movement where truth speaks
                      and justice prevails.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  <StatCard
                    label="Published Stories"
                    value={String(articleCount).padStart(2, "0")}
                    copy="A growing body of stories across politics, business, legal affairs, science, sports, lifestyle, and deeply reported public-interest journalism."
                  />
                  <StatCard
                    label="What We Cover"
                    value="News, analysis and accountability"
                    copy="We bring together hard reporting, informed analysis, and editorial judgment to explain what matters and why it matters."
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="mt-12 grid gap-6 lg:grid-cols-3">
            <div className="rounded-[28px] border border-neutral-800 bg-neutral-950 p-6 lg:col-span-2">
              <div
                className="text-xs uppercase tracking-[0.24em]"
                style={{ color: "var(--veritas-red)" }}
              >
                What The Veritas stands for
              </div>
              <h2 className="mt-4 font-serif text-4xl text-white">A newsroom built around public trust</h2>
              <div className="mt-6 space-y-5 text-base leading-8 text-neutral-300">
                <p>
                  The Veritas exists to make truth clearer in a noisy world. We believe journalism
                  must be rigorous, accessible, and accountable to the people it serves.
                </p>
                <p>
                  Our work focuses on facts before narratives, evidence before noise, and context
                  before outrage. Whether the story is political, legal, economic, or social, we
                  aim to report it with clarity, fairness, and moral seriousness.
                </p>
                <p>
                  We do not see journalism as content production. We see it as civic work. That
                  means asking harder questions, following complicated stories longer, and making
                  sure the people affected by decisions are not treated as footnotes.
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-neutral-800 bg-neutral-950 p-6">
              <div
                className="text-xs uppercase tracking-[0.24em]"
                style={{ color: "var(--veritas-red)" }}
              >
                Editorial approach
              </div>
              <ul className="mt-6 space-y-4 text-sm leading-7 text-neutral-300">
                <li>Fact-checked, source-led reporting</li>
                <li>Clear separation of reporting, analysis, and editorial voice</li>
                <li>Attention to underreported stories and overlooked communities</li>
                <li>Context-rich publishing instead of headline-only coverage</li>
                <li>Fast publishing without sacrificing responsibility</li>
              </ul>
            </div>
          </section>

          <section className="mt-12">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div
                  className="text-xs uppercase tracking-[0.24em]"
                  style={{ color: "var(--veritas-red)" }}
                >
                  Editorial team
                </div>
                <h2 className="mt-3 font-serif text-4xl text-white">The people behind The Veritas</h2>
                <p className="mt-2 text-neutral-400">
                  Meet the editors and bylined voices shaping the publication.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {authors.map((profile) => (
                <article
                  key={profile.slug}
                  className="rounded-[24px] border border-neutral-800 bg-neutral-950 p-6"
                >
                  <div className="flex items-start gap-4">
                    <TeamAvatar profile={profile} />
                    <div className="min-w-0">
                      <div className="font-serif text-2xl leading-tight text-white">{profile.name}</div>
                      <div
                        className="mt-2 text-sm uppercase tracking-[0.22em]"
                        style={{ color: "var(--veritas-red)" }}
                      >
                        {profile.role}
                      </div>
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-7 text-neutral-300">{profile.bio}</p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      to={`/authors/${profile.slug}`}
                      className="inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-[var(--veritas-red)] hover:text-[var(--veritas-red)]"
                    >
                      View Profile
                    </Link>

                    {profile.linkedin ? (
                      <a
                        href={profile.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-[var(--veritas-red)] hover:text-[var(--veritas-red)]"
                      >
                        LinkedIn
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  try {
    const response = await fetch(`${API_BASE}/articles`);
    const articles = response.ok ? await response.json() : [];

    return {
      props: {
        authors: collectAuthorProfiles(Array.isArray(articles) ? articles : []),
        articleCount: Array.isArray(articles) ? articles.length : 0
      },
      revalidate: 60
    };
  } catch {
    return {
      props: {
        authors: collectAuthorProfiles([]),
        articleCount: 0
      },
      revalidate: 60
    };
  }
}
