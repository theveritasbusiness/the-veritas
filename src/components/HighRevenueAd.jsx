import React, { useEffect, useRef } from "react";

const AD_FORMATS = {
  banner: {
    key: "e56f6010f7e81f30c014f50453ebc2de",
    width: 728,
    height: 90,
  },
  rectangle: {
    key: "9b05c6f9c29b725b02efa5ee0b1e2b45",
    width: 300,
    height: 250,
  },
};

export default function HighRevenueAd({ format = "banner", className = "" }) {
  const adContainerRef = useRef(null);
  const ad = AD_FORMATS[format] || AD_FORMATS.banner;

  useEffect(() => {
    const container = adContainerRef.current;
    if (!container) return;

    // Clear previous ad content to prevent duplicating on re-renders
    container.innerHTML = "";

    // 1. Create iframe wrapper
    const iframe = document.createElement("iframe");
    iframe.style.width = `${ad.width}px`;
    iframe.style.height = `${ad.height}px`;
    iframe.style.border = "0";
    iframe.style.scrolling = "no";
    iframe.style.overflow = "hidden";
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("scrolling", "no");

    container.appendChild(iframe);

    // 2. Write the Adsterra Script into the iFrame document directly
    const iframeDoc = iframe.contentWindow || iframe.contentDocument.document || iframe.contentDocument;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            html, body { margin: 0; padding: 0; overflow: hidden; background: transparent; }
          </style>
        </head>
        <body>
          <script type="text/javascript">
            atOptions = {
              'key' : '${ad.key}',
              'format' : 'iframe',
              'height' : ${ad.height},
              'width' : ${ad.width},
              'params' : {}
            };
          </script>
          <script type="text/javascript" src="https://www.highrevenueformat.com/${ad.key}/invoke.js"></script>
        </body>
      </html>
    `;

    iframeDoc.document.open();
    iframeDoc.document.write(htmlContent);
    iframeDoc.document.close();

    return () => {
      if (container) container.innerHTML = "";
    };
  }, [format, ad.key, ad.width, ad.height]);

  return (
    <div className={`relative mx-auto flex w-full justify-center overflow-hidden ${className}`.trim()}>
      <div 
        ref={adContainerRef} 
        style={{ width: `${ad.width}px`, height: `${ad.height}px` }}
        className="flex items-center justify-center bg-neutral-950/50"
      />
      <span className="pointer-events-none absolute right-2 top-2 z-10 rounded bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-neutral-300 backdrop-blur-md border border-white/10">
        Advertisement
      </span>
    </div>
  );
}