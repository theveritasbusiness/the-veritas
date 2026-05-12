import Layout from "../src/components/Layout";
import TheVeritasShowcase from "../src/TheVeritasShowcase";
import { CATEGORY_CONFIG, getCategoryConfigBySlug } from "../src/content/categories";
import { API_BASE } from "../src/lib/env";

export default function CategoryPage(props) {
  return (
    <Layout>
      <TheVeritasShowcase {...props} />
    </Layout>
  );
}

export async function getStaticPaths() {
  return {
    paths: CATEGORY_CONFIG.map((category) => ({ params: { slug: category.slug } })),
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const category = getCategoryConfigBySlug(params?.slug);

  if (!category) {
    return { notFound: true };
  }

  try {
    const [articlesRes, breakingRes] = await Promise.all([
      fetch(`${API_BASE}/articles`),
      fetch(`${API_BASE}/articles/breaking`)
    ]);

    const [initialArticles, initialBreaking] = await Promise.all([
      articlesRes.ok ? articlesRes.json() : [],
      breakingRes.ok ? breakingRes.json() : []
    ]);

    return {
      props: {
        initialArticles: Array.isArray(initialArticles) ? initialArticles : [],
        initialBreaking: Array.isArray(initialBreaking) ? initialBreaking : [],
        initialLoadError: "",
        forcedCategory: category.name,
        pageTitle: `${category.title} | The Veritas`,
        pageDescription: category.description,
        pageCanonical: `https://www.theveritas.in/${category.slug}`
      },
      revalidate: 60
    };
  } catch {
    return {
      props: {
        initialArticles: [],
        initialBreaking: [],
        initialLoadError: "",
        forcedCategory: category.name,
        pageTitle: `${category.title} | The Veritas`,
        pageDescription: category.description,
        pageCanonical: `https://www.theveritas.in/${category.slug}`
      },
      revalidate: 60
    };
  }
}
