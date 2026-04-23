import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate, useSearchParams } from "../lib/router";
import { LIVE_MONITOR_URL } from "../api";

const categories = [
  "Home",
  "World",
  "India",
  "The Veritas Desk",
  "About Us",
  "Politics",
  "Business",
  "Science",
  "Legal",
  "Lifestyle",
  "Sports"
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category");
  const querySearch = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(querySearch);
  const isExternalLiveUrl = /^https?:\/\//i.test(LIVE_MONITOR_URL);
  const isTrendingRoute = location.pathname === "/trending";

  useEffect(() => {
    setSearchQuery(querySearch);
  }, [querySearch]);

  const liveButtonProps = isExternalLiveUrl
    ? {
        href: LIVE_MONITOR_URL,
        target: "_blank",
        rel: "noreferrer"
      }
    : {
        href: LIVE_MONITOR_URL
      };

  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden">
      <header className="bg-neutral-900 border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-4">
            <div className="text-neutral-400 text-sm">
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </div>

            <Link to="/" className="flex justify-center" aria-label="Go to The Veritas homepage">
              <img
                src="/Logo_Edit_4.png"
                className="h-16 lg:h-20 w-auto object-contain"
                alt="The Veritas"
              />
            </Link>

            <div className="flex items-center justify-end gap-3">
              <form className="veritas-search" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => {
                    const nextQuery = e.target.value;
                    setSearchQuery(nextQuery);
                    navigate(nextQuery ? `/?search=${encodeURIComponent(nextQuery)}` : "/");
                  }}
                />
                <i className="fa fa-search" />
              </form>

              <a
                {...liveButtonProps}
                className="live-cta"
                aria-label="Open The Veritas Monitor live dashboard"
              >
                <span className="live-cta-dot" aria-hidden="true" />
                <span className="live-cta-text">LIVE</span>
              </a>
            </div>
          </div>

          <div className="md:hidden flex items-center justify-between gap-3">
            <Link to="/" className="flex min-w-0 flex-1" aria-label="Go to The Veritas homepage">
              <img
                src="/Logo_Edit_4.png"
                className="h-10 w-auto max-w-[220px] object-contain"
                alt="The Veritas"
              />
            </Link>

            <div className="flex items-center justify-end gap-2 shrink-0">
              <form className="veritas-search" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => {
                    const nextQuery = e.target.value;
                    setSearchQuery(nextQuery);
                    navigate(nextQuery ? `/?search=${encodeURIComponent(nextQuery)}` : "/");
                  }}
                />
                <i className="fa fa-search" />
              </form>

              <a
                {...liveButtonProps}
                className="live-cta"
                aria-label="Open The Veritas Monitor live dashboard"
              >
                <span className="live-cta-dot" aria-hidden="true" />
                <span className="live-cta-text">LIVE</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 overflow-x-auto no-scrollbar">
          <ul className="flex w-max min-w-full justify-start md:justify-center gap-5 sm:gap-7 py-3 text-sm whitespace-nowrap">
            {categories.map((item) => {
              const isActive =
                (item === "Home" && !selectedCategory && !isTrendingRoute) ||
                (item === "The Veritas Desk" && isTrendingRoute) ||
                selectedCategory === item;

              return (
                <li
                  key={item}
                  className="cursor-pointer transition-colors text-sm text-white/90 hover:text-[var(--veritas-red)] font-serif"
                  style={{ color: isActive ? "var(--veritas-red)" : undefined }}
                  onClick={() => {
                    if (item === "Home") {
                      navigate("/");
                    } else if (item === "The Veritas Desk") {
                      navigate("/trending");
                    } else if (item === "About Us") {
                      navigate("/about");
                    } else {
                      navigate(`/?category=${item}`);
                    }
                  }}
                >
                  {item}
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {children || <Outlet />}

      <footer className="border-t border-neutral-800 mt-10 py-6 text-center text-sm text-neutral-400 px-4">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
          <Link to="/about">About Us</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms & Conditions</Link>
        </div>
      </footer>

      <style>{`
.veritas-search {
  position: relative;
  width: 46px;
  height: 46px;
  background: #0b0b0b;
  border: 2px solid #1f1f1f;
  border-radius: 999px;
  padding: 5px;
  transition: all 0.35s ease;
  flex-shrink: 0;
}

.veritas-search input {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 100%;
  border: none;
  background: transparent;
  color: white;
  padding: 0 18px;
  transition: width 0.35s ease;
  font-size: 0.95rem;
  outline: none;
}

.veritas-search .fa {
  padding: 10px;
  width: 36px;
  height: 36px;
  position: absolute;
  top: 3px;
  right: 3px;
  border-radius: 50%;
  color: #aaa;
  text-align: center;
  cursor: pointer;
}

.veritas-search:hover,
.veritas-search:focus-within {
  width: min(44vw, 180px);
  border-color: var(--veritas-red);
}

.veritas-search:hover input,
.veritas-search:focus-within input {
  width: 100%;
}

.veritas-search:hover .fa,
.veritas-search:focus-within .fa {
  background: var(--veritas-red);
  color: black;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.live-cta {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0.8rem 1.15rem;
  min-width: 112px;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid rgba(222, 2, 22, 0.78);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-family: inherit;
  background: #de0216;
  box-shadow:
    0 0 0 1px rgba(222, 2, 22, 0.5),
    0 0 14px rgba(222, 2, 22, 0.28);
  transition: transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease;
}

.live-cta:hover {
  transform: translateY(-1px);
  filter: brightness(1.03);
  box-shadow:
    0 0 0 1px rgba(222, 2, 22, 0.58),
    0 0 20px rgba(222, 2, 22, 0.34);
}

.live-cta-text,
.live-cta-dot {
  position: relative;
  z-index: 1;
}

.live-cta-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.65);
  animation: liveBlink 1.05s ease-in-out infinite;
}

@keyframes liveBlink {
  0%,
  100% {
    opacity: 1;
    transform: scale(0.92);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.45);
  }
  50% {
    opacity: 0.55;
    transform: scale(1.18);
    box-shadow: 0 0 0 8px rgba(255, 255, 255, 0);
  }
}

@media (max-width: 640px) {
  .veritas-search {
    width: 42px;
    height: 42px;
  }

  .veritas-search .fa {
    width: 32px;
    height: 32px;
    top: 3px;
    right: 3px;
    padding: 8px;
  }

  .live-cta {
    min-width: 82px;
    padding: 0.58rem 0.78rem;
    letter-spacing: 0.12em;
    gap: 7px;
    font-size: 0.72rem;
  }

  .live-cta-dot {
    width: 8px;
    height: 8px;
  }
}
      `}</style>
    </div>
  );
}
