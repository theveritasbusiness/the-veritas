import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import logoAsset from "../assets/Logo_Edit_4.png";

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

  useEffect(() => {
    setSearchQuery(querySearch);
  }, [querySearch]);

  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden">
      <div className="bg-neutral-900 border-b border-neutral-800 px-3 sm:px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-3">
          <div className="hidden md:block text-neutral-400 text-sm shrink-0">
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric"
            })}
          </div>

          <div className="flex justify-center w-full">
            <Link to="/" className="min-w-0 flex items-center justify-center">
              <img
                src={logoAsset}
                className="h-12 sm:h-14 md:h-16 w-auto object-contain max-w-full"
                alt="The Veritas"
              />
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-3 shrink-0">
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

            <button
              className="text-black px-4 sm:px-5 py-2 rounded-full text-sm font-medium"
              style={{ backgroundColor: "var(--veritas-red)" }}
            >
              Join
            </button>
          </div>
        </div>
      </div>

      <nav className="border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 overflow-x-auto no-scrollbar">
          <ul className="flex w-max min-w-full justify-start sm:justify-center gap-5 sm:gap-7 py-3 text-sm whitespace-nowrap">
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
      `}</style>
    </div>
  );
}
