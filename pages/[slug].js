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

function minimizeArticle(article) {
  if (!article) return null;
  return {
    id: article.id || null,
    title: article.title || "",
    slug: article.slug || "",
    category: article.category || "",
    subcategory: article.subcategory || "",
    subcategory_slug: article.subcategory_slug || "",
    hero_image: article.hero_image || null,
    hero_focus: article.hero_focus || null,
    hero_crop: article.hero_crop || null,
    is_breaking: Boolean(article.is_breaking),
    is_live: Boolean(article.is_live),
    is_editorial: Boolean(article.is_editorial),
    is_exclusive: Boolean(article.is_exclusive),
    exclusive: Boolean(article.exclusive),
    published_at: article.published_at || null,
    published_ago: article.published_ago || null,
    live_updated_at: article.live_updated_at || null,
    show_on_slider: Boolean(article.show_on_slider),
    show_on_category_slider: Boolean(article.show_on_category_slider),
    subheadline: article.subheadline || "",
    image_caption: article.image_caption || "",
    photo_credit: article.photo_credit || "",
    hero_caption: article.hero_caption || "",
    paragraphs: Array.isArray(article.paragraphs) && article.paragraphs.length > 0
      ? [article.paragraphs[0]]
      : []
  };
}

export async function getStaticProps({ params }) {
  const category = getCategoryConfigBySlug(params?.slug);

  if (!category) {
    return { notFound: true };
  }

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

    const minimizedArticles = (Array.isArray(initialArticles) ? initialArticles : [])
      .slice(0, 60)
      .map(minimizeArticle)
      .filter(Boolean);

    const minimizedBreaking = (Array.isArray(initialBreaking) ? initialBreaking : [])
      .map(minimizeArticle)
      .filter(Boolean);

    return {
      props: {
        initialArticles: minimizedArticles,
        initialBreaking: minimizedBreaking,
        initialSubcategories: Array.isArray(initialSubcategories) ? initialSubcategories : [],
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
        initialSubcategories: [],
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
