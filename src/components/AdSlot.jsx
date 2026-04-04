import React, { useEffect, useRef } from "react";
import { ADSENSE_CLIENT } from "../lib/env";

let adsenseScriptPromise = null;

function loadAdSenseScript() {
  if (!ADSENSE_CLIENT || typeof document === "undefined") {
    return Promise.resolve(false);
  }

  if (adsenseScriptPromise) {
    return adsenseScriptPromise;
  }

  const existingScript = document.querySelector('script[data-veritas-adsense="true"]');
  if (existingScript) {
    adsenseScriptPromise = Promise.resolve(true);
    return adsenseScriptPromise;
  }

  adsenseScriptPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.dataset.veritasAdsense = "true";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

  return adsenseScriptPromise;
}

export default function AdSlot({
  slot = "",
  label = "Advertisement",
  className = "",
  format = "auto",
  style = {},
  fullWidthResponsive = true
}) {
  const adRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function initAd() {
      if (!ADSENSE_CLIENT || !slot || !adRef.current) return;

      const loaded = await loadAdSenseScript();
      if (!loaded || cancelled || !adRef.current) return;

      try {
        if (!adRef.current.dataset.adLoaded) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          adRef.current.dataset.adLoaded = "true";
        }
      } catch (error) {
        console.error("AdSense slot failed to initialize:", error);
      }
    }

    initAd();
    return () => {
      cancelled = true;
    };
  }, [slot]);

  if (!ADSENSE_CLIENT || !slot) {
    return null;
  }

  return (
    <div className={`rounded-2xl border border-neutral-800 bg-neutral-950 p-3 sm:p-4 ${className}`}>
      <div className="mb-3 text-[10px] uppercase tracking-[0.28em] text-neutral-500">
        {label}
      </div>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={String(fullWidthResponsive)}
      />
    </div>
  );
}
