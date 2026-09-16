import { useState, useEffect } from "react";
import Script from "next/script";

export default function AnalyticsLoader() {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    try {
      const ok = localStorage.getItem("cookieAccepted") === "true";
      if (ok) setAccepted(true);
    } catch (e) {
      // ignore
    }
  }, []);

  if (!accepted) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9106312967186703"
        crossOrigin="anonymous"
      />

    </>
  );
}
