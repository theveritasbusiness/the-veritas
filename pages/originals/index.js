import Layout from "../../src/components/Layout";
import OriginalsPage from "../../src/OriginalsPage";
import { API_BASE } from "../../src/lib/env";

export default function TheVeritasOriginalPage(props) {
  return (
    <Layout>
      <OriginalsPage {...props} />
    </Layout>
  );
}

export async function getStaticProps() {
  try {
    const response = await fetch(`${API_BASE}/originals`);
    const originals = response.ok ? await response.json() : [];

    return {
      props: {
        initialOriginals: Array.isArray(originals) ? originals : [],
        initialError: ""
      },
      revalidate: 60
    };
  } catch {
    return {
      props: {
        initialOriginals: [],
        initialError: ""
      },
      revalidate: 60
    };
  }
}
