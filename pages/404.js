import Layout from "../src/components/Layout";
import Seo from "../src/components/Seo";
import { Link } from "../src/lib/router";

export default function NotFoundPage() {
  return (
    <Layout>
      <Seo
        title="Page Not Found"
        description="The page you were looking for could not be found on The Veritas."
        path="/404"
        robots="noindex,follow"
      />
      <div className="mx-auto max-w-3xl px-6 py-24 text-center text-white">
        <div className="text-sm uppercase tracking-[0.22em] text-[var(--veritas-red)]">
          Error 404
        </div>
        <h1 className="mt-4 font-serif text-5xl font-bold">Page not found</h1>
        <p className="mt-6 text-lg leading-8 text-neutral-300">
          The page you requested does not exist, may have moved, or may no longer be available.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:border-[var(--veritas-red)] hover:text-[var(--veritas-red)]"
        >
          Return to Homepage
        </Link>
      </div>
    </Layout>
  );
}
