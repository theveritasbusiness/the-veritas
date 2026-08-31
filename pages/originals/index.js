import Layout from "../../src/components/Layout";
import OriginalsPage from "../../src/OriginalsPage";
import { API_BASE } from "../../src/lib/env";

export default function OriginalsIndexPage({ originals }) {
  return (
    <Layout>
      <OriginalsPage initialOriginals={originals} />
    </Layout>
  );
}

export async function getServerSideProps() {
  try {
    const response = await fetch(`${API_BASE}/originals`);
    const originals = response.ok ? await response.json() : [];
    return { props: { originals: Array.isArray(originals) ? originals : [] } };
  } catch {
    return { props: { originals: [] } };
  }
}
