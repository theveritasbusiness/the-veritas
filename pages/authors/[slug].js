import Layout from "../../src/components/Layout";
import Seo from "../../src/components/Seo";
import { Link } from "../../src/lib/router";
import { API_BASE } from "../../src/lib/env";
import { collectAuthorProfiles, getAuthorInitials, getAuthorProfile } from "../../src/content/authors";
import { getArticleDisplayTime } from "../../src/utils/time";

function AuthorAvatar({ profile }) {
  if (profile.image) {
    return (
      <img
        src={profile.image}
        alt={profile.name}
        className="h-24 w-24 rounded-[22px] object-cover"
      />
    );
  }

  return (
    <div className="flex h-24 w-24 items-center justify-center rounded-[22px] border border-white/10 bg-neutral-900 text-3xl font-semibold text-white">
      {profile.initials || getAuthorInitials(profile.name)}
    </div>
  );
}

export default function AuthorPage({ profile, articles }) {
  return (
    <Layout>
      <Seo
        title={profile.name}
        description={`${profile.name} | ${profile.role} at The Veritas.`}
        path={`/authors/${profile.slug}`}
      />

      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <section className="rounded-[30px] border border-neutral-800 bg-[radial-gradient(circle_at_top,#220207_0%,#101010_36%,#040404_74%)] p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-5">
                <AuthorAvatar profile={profile} />
                <div className="min-w-0">
                  <div
                    className="text-xs uppercase tracking-[0.22em]"
                    style={{ color: "var(--veritas-red)" }}
                  >
                    Author Profile
                  </div>
                  <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
                    {profile.name}
                  </h1>
                  <div className="mt-3 text-lg text-neutral-300">{profile.role}</div>
                  <p className="mt-5 max-w-3xl text-base leading-8 text-neutral-300">
                    {profile.bio}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/about"
                  className="inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-[var(--veritas-red)] hover:text-[var(--veritas-red)]"
                >
                  About Us
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
            </div>
          </section>

          <section className="mt-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-4xl text-white">Articles by {profile.name}</h2>
                <p className="mt-2 text-neutral-400">
                  Writing, analysis, and reportage published on The Veritas.
                </p>
              </div>
              <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-neutral-300">
                {articles.length} article{articles.length === 1 ? "" : "s"}
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  to={`/article/${article.slug}`}
                  className="rounded-[24px] border border-neutral-800 bg-neutral-950 p-5 transition hover:border-neutral-600"
                >
                  <div
                    className="text-xs uppercase tracking-[0.22em]"
                    style={{ color: "var(--veritas-red)" }}
                  >
                    {article.category || "Monitor"}
                  </div>
                  <div className="mt-3 font-serif text-3xl leading-tight text-white">
                    {article.title}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-neutral-300">
                    {article.subheadline || article.paragraphs?.[0]?.slice(0, 160) || "Read the full story on The Veritas."}
                  </p>
                  <div className="mt-5 text-sm text-neutral-500">
                    {getArticleDisplayTime(article)}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ params }) {
  const slug = params?.slug;

  if (!slug) {
    return { notFound: true };
  }

  try {
    const response = await fetch(`${API_BASE}/articles`);
    const articles = response.ok ? await response.json() : [];
    const allProfiles = collectAuthorProfiles(Array.isArray(articles) ? articles : []);
    const profile = allProfiles.find((item) => item.slug === slug) || getAuthorProfile(slug.replace(/-/g, " "));
    const authorArticles = (Array.isArray(articles) ? articles : []).filter(
      (article) => getAuthorProfile(article.author_name || "The Veritas Desk").slug === slug
    );

    if (authorArticles.length === 0 && !profile) {
      return { notFound: true };
    }

    return {
      props: {
        profile,
        articles: authorArticles
      }
    };
  } catch {
    return { notFound: true };
  }
}
