import React, { useEffect, useRef } from "react";

const marketSymbols = [
  { proName: "NSE:NIFTY", title: "NIFTY 50" },
  { proName: "NSE:BANKNIFTY", title: "NIFTY BANK" },
  { proName: "BSE:SENSEX", title: "BSE SENSEX" },
  { proName: "NSE:INDIAVIX", title: "INDIA VIX" },
  { proName: "NSE:NIFTYNXT50", title: "NIFTY NEXT 50" },
  { proName: "NSE:CNXMIDCAP", title: "NIFTY MIDCAP 100" },
  { proName: "NSE:CNXSMALLCAP", title: "NIFTY SMALLCAP 100" },
  { proName: "FX_IDC:XAUUSD", title: "GOLD" },
  { proName: "FX_IDC:XAGUSD", title: "SILVER" },
  { proName: "TVC:USOIL", title: "CRUDE OIL" },
  { proName: "TVC:DXY", title: "DOLLAR INDEX" },
  { proName: "NSEIX:NIFTY1!", title: "GIFT NIFTY" },
  { proName: "FOREXCOM:DJI", title: "DOW JONES" },
  { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
  { proName: "NASDAQ:IXIC", title: "NASDAQ" },
  { proName: "NSE:NIFTY_TOTAL_MKT", title: "NIFTY TOTAL MARKET" }
];

export default function MarketTickerTape() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    containerRef.current.innerHTML = "";

    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container__widget";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: marketSymbols,
      showSymbolLogo: false,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: "dark",
      locale: "en"
    });

    containerRef.current.appendChild(widgetContainer);
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-3 sm:px-4 mt-4 sm:mt-6">
      <div className="market-strip rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden">
        <div className="market-strip-label">
          <span className="market-strip-dot" aria-hidden="true" />
          <span>Market Pulse</span>
        </div>
        <div ref={containerRef} className="market-strip-widget" />
      </div>

      <style>{`
        .market-strip {
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02);
        }

        .market-strip-label {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #f5f5f5;
          background:
            linear-gradient(90deg, rgba(222, 2, 22, 0.14), rgba(0, 0, 0, 0));
        }

        .market-strip-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #de0216;
          box-shadow: 0 0 14px rgba(222, 2, 22, 0.5);
        }

        .market-strip-widget {
          min-height: 64px;
        }
      `}</style>
    </section>
  );
}
