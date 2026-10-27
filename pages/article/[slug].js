import Layout from "../../src/components/Layout";
import ArticlePage from "../../src/ArticlePage";
import ReadMore from "../../src/components/ReadMore";
import { buildReadMore } from "../../src/content/categories";
import { API_BASE } from "../../src/lib/env";

function cleanArticleSlug(slug) {
  return String(slug || "").trim().replace(/-\d{10,}$/, "");
}

export default function ArticleRoute({ readMore = [], ...props }) {
  return (
    <Layout>
      <ArticlePage {...props} />
      <ReadMore articles={readMore} category={props.initialArticle?.category || ""} />
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

    const normalizedIncomingSlug = cleanArticleSlug(slug);
    const normalizedArticleSlug = cleanArticleSlug(initialArticle?.slug);

    if (normalizedArticleSlug && normalizedArticleSlug !== slug) {
      return {
        redirect: {
          destination: `/article/${normalizedArticleSlug}`,
          permanent: true
        }
      };
    }

    if (normalizedIncomingSlug && normalizedIncomingSlug !== slug) {
      return {
        redirect: {
          destination: `/article/${normalizedIncomingSlug}`,
          permanent: true
        }
      };
    }

    return {
      props: {
        initialArticle: initialArticle || null,
        initialLatest: Array.isArray(latestData) ? latestData.slice(0, 5) : [],
        readMore: buildReadMore(Array.isArray(latestData) ? latestData : [], initialArticle),
        initialError: ""
      }
    };
  } catch {
    return { notFound: true };
  }
}
