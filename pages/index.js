import Layout from "../src/components/Layout";
import TheVeritasShowcase from "../src/TheVeritasShowcase";
import { API_BASE } from "../src/lib/env";

export default function HomePage(props) {
  return (
    <Layout>
      <TheVeritasShowcase {...props} />
    </Layout>
  );
}

export async function getStaticProps() {
  try {
    const [articlesRes, breakingRes, subcategoriesRes] = await Promise.all([
      fetch(`${API_BASE}/articles`),
      fetch(`${API_BASE}/articles/breaking`),
      fetch(`${API_BASE}/subcategories`)
    ]);

    const [initialArticles, initialBreaking, initialSubcategories] = await Promise.all([
      articlesRes.ok ? articlesRes.json() : [],
      breakingRes.ok ? breakingRes.json() : [],
      subcategoriesRes.ok ? subcategoriesRes.json() : []
    ]);

    return {
      props: {
        initialArticles: Array.isArray(initialArticles) ? initialArticles : [],
        initialBreaking: Array.isArray(initialBreaking) ? initialBreaking : [],
        initialSubcategories: Array.isArray(initialSubcategories) ? initialSubcategories : [],
        initialLoadError: ""
      },
      revalidate: 60
    };
  } catch {
    return {
      props: {
        initialArticles: [],
        initialBreaking: [],
        initialSubcategories: [],
        initialLoadError: ""
      },
      revalidate: 60
    };
  }
}
