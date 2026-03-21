import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import logoAsset from "../assets/Logo_Edit_4.png";
import { LIVE_MONITOR_URL } from "../api";

const categories = [
  "Home",
  "Geopolitics",
  "India",
  "Trending",
  "Politics",
  "Legal",
  "Entertainment",
  "Sports"
];

export default function Layout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category");
  const querySearch = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(querySearch);
  const isExternalLiveUrl = /^https?:\/\//i.test(LIVE_MONITOR_URL);

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
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-4">
            <div className="text-neutral-400 text-sm">
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </div>

            <Link to="/" className="flex justify-center">
              <img
                src={logoAsset}
                className="h-14 lg:h-16 w-auto object-contain"
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
                className="text-black px-5 py-2 rounded-full text-sm font-semibold live-cta"
                style={{ backgroundColor: "var(--veritas-red)" }}
              >
                LIVE
              </a>
            </div>
          </div>

          <div className="md:hidden flex flex-col items-center gap-3">
            <Link to="/" className="flex justify-center">
              <img
                src={logoAsset}
                className="h-12 w-auto object-contain"
                alt="The Veritas"
              />
            </Link>

            <div className="flex items-center justify-center gap-3">
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
                className="text-black px-5 py-2 rounded-full text-sm font-semibold live-cta"
                style={{ backgroundColor: "var(--veritas-red)" }}
              >
                LIVE
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
                (item === "Home" && !selectedCategory) || selectedCategory === item;

              return (
                <li
                  key={item}
                  className="cursor-pointer transition-colors text-sm text-white/90 hover:text-[var(--veritas-red)]"
                  style={{ color: isActive ? "var(--veritas-red)" : undefined }}
                  onClick={() => {
                    if (item === "Home") {
                      navigate("/");
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

      <Outlet />

      <footer className="border-t border-neutral-800 mt-10 py-6 text-center text-sm text-neutral-400 px-4">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
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
  box-shadow: 0 0 0 1px rgba(222, 2, 22, 0.35), 0 0 26px rgba(222, 2, 22, 0.28);
}
      `}</style>
    </div>
  );
}
