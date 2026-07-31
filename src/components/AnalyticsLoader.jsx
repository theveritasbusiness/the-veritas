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

      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-CGB4JKXZ8J"
      />

      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-CGB4JKXZ8J');`}
      </Script>
    </>
  );
}
