import Layout from "../../src/components/Layout";
import OriginalsPage from "../../src/OriginalsPage";
import FeaturedSections from "../../src/components/FeaturedSections";
import { buildFeaturedSections } from "../../src/content/categories";
import { API_BASE } from "../../src/lib/env";

export default function TheVeritasOriginalPage({ featuredSections = [], ...props }) {
  return (
    <Layout>
      <OriginalsPage {...props} />
      <FeaturedSections sections={featuredSections} />
    </Layout>
  );
}

export async function getStaticProps() {
  try {
    const [originalsRes, articlesRes] = await Promise.all([
      fetch(`${API_BASE}/originals`),
      fetch(`${API_BASE}/articles`)
    ]);
    const [originals, articles] = await Promise.all([
      originalsRes.ok ? originalsRes.json() : [],
      articlesRes.ok ? articlesRes.json() : []
    ]);

    return {
      props: {
        initialOriginals: Array.isArray(originals) ? originals : [],
        featuredSections: buildFeaturedSections(Array.isArray(articles) ? articles : []),
        initialError: ""
      },
      revalidate: 60
    };
  } catch {
    return {
      props: {
        initialOriginals: [],
        featuredSections: [],
        initialError: ""
      },
      revalidate: 60
    };
  }
}
