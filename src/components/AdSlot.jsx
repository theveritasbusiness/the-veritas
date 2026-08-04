import React, { useEffect, useRef } from "react";
import { ADSENSE_CLIENT, MONETAG_DIRECT_LINK } from "../lib/env";

export default function AdSlot({
  slot = "",
  label = "Advertisement",
  className = "",
  format = "auto",
  style = {},
  fullWidthResponsive = true,
  directLinkHref = MONETAG_DIRECT_LINK
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

  if (directLinkHref) {
    return (
      <div className={`rounded-2xl border border-neutral-800 bg-neutral-950 p-3 sm:p-4 ${className}`}>
        <div className="mb-3 text-[10px] uppercase tracking-[0.28em] text-neutral-500">
          {label}
        </div>
        <a
          href={directLinkHref}
          target="_blank"
          rel="noreferrer"
          className="group flex min-h-[120px] w-full items-center justify-between rounded-xl border border-[rgba(222,2,22,0.24)] bg-[linear-gradient(135deg,rgba(34,4,8,0.92),rgba(10,10,10,0.96))] px-5 py-4 text-left transition hover:border-[rgba(222,2,22,0.5)] hover:bg-[linear-gradient(135deg,rgba(46,6,11,0.98),rgba(12,12,12,0.98))]"
        >
          <div className="pr-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--veritas-red)]">
              Partner Offer
            </div>
            <div className="mt-2 font-serif text-xl text-white sm:text-2xl">
              Explore sponsored recommendations
            </div>
            <div className="mt-2 text-sm leading-relaxed text-neutral-400">
              Curated commercial links matched for interested readers.
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition group-hover:border-[var(--veritas-red)] group-hover:text-[var(--veritas-red)]">
            Open
          </span>
        </a>
      </div>
    );
  }

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
