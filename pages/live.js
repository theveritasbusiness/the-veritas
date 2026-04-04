import { LIVE_MONITOR_URL } from "../src/lib/env";

export default function LivePage() {
  return null;
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: LIVE_MONITOR_URL,
      permanent: false
    }
  };
}
