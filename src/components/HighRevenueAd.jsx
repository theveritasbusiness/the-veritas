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
  const ad = AD_FORMATS[format] || AD_FORMATS.banner;
  const source = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style></head><body><script>atOptions={'key':'${ad.key}','format':'iframe','height':${ad.height},'width':${ad.width},'params':{}};<\/script><script src="https://www.highrevenueformat.com/${ad.key}/invoke.js"><\/script></body></html>`;

  return (
    <div className={`relative mx-auto flex w-full justify-center overflow-hidden ${className}`.trim()}>
      <iframe
        title="Advertisement"
        srcDoc={source}
        width={ad.width}
        height={ad.height}
        scrolling="no"
        sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        className="block max-w-full border-0"
        style={{ width: `${ad.width}px`, height: `${ad.height}px` }}
      />
      <span className="pointer-events-none absolute right-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-neutral-300 backdrop-blur-md border border-white/10">
        Advertisement
      </span>
    </div>
  );
}
