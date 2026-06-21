import React, { useEffect, useRef } from "react";
import { ADSENSE_CLIENT } from "../lib/env";

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
    let observer;
    let retryTimeout;
    let retryCount = 0;

    function initAd() {
      if (!ADSENSE_CLIENT || !slot || !adRef.current) return;
      if (typeof window === "undefined" || cancelled || !adRef.current) return;

      if (!window.adsbygoogle) {
        if (retryCount < 6) {
          retryCount += 1;
          retryTimeout = window.setTimeout(initAd, 500);
        }
        return;
      }

      try {
        if (!adRef.current.dataset.adLoaded) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          adRef.current.dataset.adLoaded = "true";
        }
      } catch (error) {
        console.error("AdSense slot failed to initialize:", error);
      }
    }

    if (typeof IntersectionObserver === "undefined") {
      initAd();
    } else if (adRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry?.isIntersecting) {
            initAd();
            observer?.disconnect();
          }
        },
        { rootMargin: "200px 0px" }
      );

      observer.observe(adRef.current);
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      if (retryTimeout) {
        window.clearTimeout(retryTimeout);
      }
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
