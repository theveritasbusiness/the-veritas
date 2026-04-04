import Layout from "../../src/components/Layout";
import ArticlePage from "../../src/ArticlePage";
import { API_BASE } from "../../src/lib/env";

export default function ArticleRoute(props) {
  return (
    <Layout>
      <ArticlePage {...props} />
    </Layout>
  );
}

export async function getServerSideProps({ params }) {
  const slug = params?.slug;

  if (!slug) {
    return { notFound: true };
  }

  try {
    const [articleRes, latestRes] = await Promise.all([
      fetch(`${API_BASE}/articles/${slug}`),
      fetch(`${API_BASE}/articles`)
    ]);

    if (!articleRes.ok) {
      return { notFound: true };
    }

    const [initialArticle, latestData] = await Promise.all([
      articleRes.json(),
      latestRes.ok ? latestRes.json() : []
    ]);

    return {
      props: {
        initialArticle: initialArticle || null,
        initialLatest: Array.isArray(latestData) ? latestData.slice(0, 5) : [],
        initialError: ""
      }
    };
  } catch {
    return {
      props: {
        initialArticle: null,
        initialLatest: [],
        initialError: "Failed to load article"
      }
    };
  }
}
