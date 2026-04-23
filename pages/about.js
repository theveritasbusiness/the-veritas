import Layout from "../src/components/Layout";
import Seo from "../src/components/Seo";
import { Link } from "../src/lib/router";
import { API_BASE } from "../src/lib/env";
import { collectAuthorProfiles } from "../src/content/authors";

function AuthorAvatar({ profile }) {
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
          <section className="overflow-hidden rounded-[30px] border border-neutral-800 bg-[radial-gradient(circle_at_top,#2f0308_0%,#111111_36%,#040404_74%)]">
            <div className="grid gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.1fr,0.9fr] lg:px-12 lg:py-14">
              <div className="max-w-3xl">
                <img
                  src="/Logo_Edit_4.png"
                  alt="The Veritas"
                  className="h-16 w-auto object-contain sm:h-20"
                />

                <div
                  className="mt-6 inline-flex items-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em]"
                  style={{ borderColor: "rgba(222,2,22,0.45)", color: "var(--veritas-red)" }}
                >
                  About The Veritas
                </div>

                <h1 className="mt-6 font-serif text-5xl leading-[0.94] sm:text-6xl lg:text-7xl">
                  The Veritas
                </h1>

                <p className="mt-3 text-xl text-neutral-300 sm:text-2xl">
                  Where truth speaks itself.
                </p>

                <div className="mt-8 space-y-5 text-lg leading-9 text-neutral-200">
                  <p>
                    The Veritas is a fearless voice for truth and justice. In an age of
                    misinformation, we practice unbiased, fact-checked, and responsible journalism.
                  </p>
                  <p>
                    We uncover hidden realities, amplify marginalized voices, and hold power to
                    account, going beyond headlines to report stories that truly impact society.
                  </p>
                  <p>
                    The Veritas is not just a media house; it is a movement where truth speaks and
                    justice prevails.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl border border-white/10 bg-black/35 p-5">
                  <div className="text-xs uppercase tracking-[0.24em] text-neutral-500">Tagline</div>
                  <div className="mt-3 font-serif text-3xl leading-tight text-white">
                    Where truth speaks itself.
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/35 p-5">
                  <div className="text-xs uppercase tracking-[0.24em] text-neutral-500">Industry</div>
                  <div className="mt-3 text-2xl font-semibold text-white">Media & Journalism</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/35 p-5">
                  <div className="text-xs uppercase tracking-[0.24em] text-neutral-500">Coverage</div>
                  <div className="mt-3 text-lg leading-8 text-neutral-300">
                    Business, analysis, politics, sports, lifestyle, entertainment, legal affairs,
                    and fast-moving national and global stories.
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/35 p-5">
                  <div className="text-xs uppercase tracking-[0.24em] text-neutral-500">Published Stories</div>
                  <div className="mt-3 text-4xl font-semibold text-white">{String(articleCount).padStart(2, "0")}</div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-4xl text-white">Editorial Team</h2>
                <p className="mt-2 text-neutral-400">
                  Meet the editors and bylined voices shaping The Veritas.
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
                    <AuthorAvatar profile={profile} />
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
