import React, { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate, useSearchParams } from "../lib/router";
import { useRouter } from "next/router";
import { LIVE_MONITOR_URL } from "../api";
import { getCategoryPath } from "../content/categories";

const categories = [
  "Home",
  "World",
  "India",
  "The Veritas Desk",
  "Politics",
  "Business",
  "Markets",
  "Tech",
  "Legal",
  "About Us"
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const router = useRouter();
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category");
  const querySearch = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(querySearch);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const burgerRef = useRef(null);
  const desktopSearchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const isExternalLiveUrl = /^https?:\/\//i.test(LIVE_MONITOR_URL);
  const isTrendingRoute = location.pathname === "/trending";

  useEffect(() => {
    setSearchQuery(querySearch);
  }, [querySearch]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        burgerRef.current &&
        !burgerRef.current.contains(e.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

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
                src="/Full_Logo.png"
                className="h-16 lg:h-20 w-auto object-contain"
                alt="The Veritas"
              />
            </Link>

            <div className="flex items-center justify-end gap-3">
              <form className="veritas-search" onSubmit={(e) => e.preventDefault()}>
                <input
                  ref={desktopSearchInputRef}
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => {
                    const nextQuery = e.target.value;
                    setSearchQuery(nextQuery);
                    const targetPath = nextQuery ? `/?search=${encodeURIComponent(nextQuery)}` : "/";
                    if (router.pathname === "/") {
                      router.replace(targetPath, undefined, { shallow: true });
                    } else {
                      navigate(targetPath);
                    }
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
                src="/Full_Logo.png"
                className="h-10 w-auto max-w-[220px] object-contain"
                alt="The Veritas"
              />
            </Link>

            <div className="flex items-center justify-end gap-2 shrink-0">
              <form className="veritas-search" onSubmit={(e) => e.preventDefault()}>
                <input
                  ref={mobileSearchInputRef}
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => {
                    const nextQuery = e.target.value;
                    setSearchQuery(nextQuery);
                    const targetPath = nextQuery ? `/?search=${encodeURIComponent(nextQuery)}` : "/";
                    if (router.pathname === "/") {
                      router.replace(targetPath, undefined, { shallow: true });
                    } else {
                      navigate(targetPath);
                    }
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

      <nav className="border-b border-neutral-800 relative">
        <div className={`max-w-6xl mx-auto px-3 sm:px-4 no-scrollbar ${isMenuOpen ? "overflow-visible" : "overflow-x-auto"}`}>
          <ul className="flex w-max min-w-full justify-start md:justify-center gap-5 sm:gap-7 py-3 text-sm whitespace-nowrap">
            {/* Burger Menu Button (Only icon, clean & bold) */}
            <li
              ref={burgerRef}
              className="cursor-pointer transition-colors text-white/90 hover:text-[var(--veritas-red)] flex items-center pr-1.5"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              <i className="fa fa-bars veritas-burger-icon" />
            </li>
            {categories.map((item) => {
              const isActive =
                (item === "Home" && !selectedCategory && !isTrendingRoute) ||
                (item === "The Veritas Desk" && isTrendingRoute) ||
                (item !== "Home" &&
                  item !== "The Veritas Desk" &&
                  item !== "About Us" &&
                  location.pathname === getCategoryPath(item)) ||
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
                      navigate(getCategoryPath(item));
                    }
                  }}
                >
                  {item}
                </li>
              );
            })}
          </ul>
        </div>

        {isMenuOpen && (
          <div
            ref={dropdownRef}
            className="veritas-menu-dropdown"
            role="menu"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="veritas-menu-dropdown-container">
              {/* Left Panel: Categories Grid */}
              <div className="veritas-menu-left">
                <div className="veritas-menu-categories-grid">
                  {[
                    { label: "Environment", path: "/environment-climate" },
                    { label: "Society & Culture", path: "/society-culture" },
                    { label: "Editorials", path: "/editorials" },
                    { label: "The Veritas Explains", path: "/the-veritas-explains" },
                    { label: "Health", path: "/health" },
                    { label: "Science", path: "/science" },
                    { label: "Lifestyle", path: "/lifestyle" },
                    { label: "Sports", path: "/sports" },
                    { label: "The Veritas Originals", path: "/originals" }
                  ].map((cat) => (
                    <Link
                      key={cat.label}
                      to={cat.path}
                      onClick={() => setIsMenuOpen(false)}
                      className="veritas-menu-category-item font-serif"
                      role="menuitem"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>

                {/* Left Panel Footer: Socials + CTA */}
                <div className="veritas-menu-left-footer">
                  <span className="veritas-menu-connect-label">Connect with us</span>
                  <div className="veritas-menu-socials">
                    <a href="https://www.instagram.com/thedailyveritas/" target="_blank" rel="noreferrer noopener" aria-label="The Veritas on Instagram">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><circle cx="12" cy="12" r="4.5" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
                    </a>
                    <a href="https://www.facebook.com/profile.php?id=61591541364176&mibextid=wwXIfr" target="_blank" rel="noreferrer noopener" aria-label="The Veritas on Facebook">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" /></svg>
                    </a>
                    <a href="https://www.linkedin.com/company/theveritas/" target="_blank" rel="noreferrer noopener" aria-label="The Veritas on LinkedIn">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
                    </a>
                    <a href="https://twitter.com/thedailyveritas" target="_blank" rel="noreferrer noopener" aria-label="The Veritas on X / Twitter">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                    </a>
                    <a href="https://www.youtube.com/channel/UCD1zd5OIOBKFWEzi6CB25DQ" target="_blank" rel="noreferrer noopener" aria-label="The Veritas on YouTube">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.94 1.96C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="black" /></svg>
                    </a>
                  </div>
                  <span className="veritas-menu-footer-divider">|</span>
                  <Link
                    to="/trending"
                    onClick={() => setIsMenuOpen(false)}
                    className="veritas-menu-footer-cta font-serif"
                  >
                    The Veritas Desk &rarr;
                  </Link>
                </div>
              </div>

              {/* Right Panel: Specials */}
              <div className="veritas-menu-right">
                <div className="veritas-menu-specials-grid">
                  {/* Column 1 */}
                  <div className="veritas-menu-specials-col">
                    <a
                      href={LIVE_MONITOR_URL}
                      {...(isExternalLiveUrl ? { target: "_blank", rel: "noreferrer" } : {})}
                      onClick={() => setIsMenuOpen(false)}
                      className="veritas-menu-special-link"
                      role="menuitem"
                    >
                      <span className="veritas-menu-live-indicator"><span className="veritas-menu-live-indicator-dot" /></span>
                      Live Monitor
                    </a>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMenuOpen(false);
                        setTimeout(() => {
                          if (window.innerWidth >= 768 && desktopSearchInputRef.current) {
                            desktopSearchInputRef.current.focus();
                            desktopSearchInputRef.current.select();
                          } else if (mobileSearchInputRef.current) {
                            mobileSearchInputRef.current.focus();
                            mobileSearchInputRef.current.select();
                          }
                        }, 80);
                      }}
                      className="veritas-menu-special-link"
                      role="menuitem"
                    >
                      <i className="fa fa-search" />
                      Search Articles
                    </a>
                    <Link
                      to="/about"
                      onClick={() => setIsMenuOpen(false)}
                      className="veritas-menu-special-link"
                      role="menuitem"
                    >
                      <i className="fa fa-info-circle" />
                      About Us
                    </Link>
                  </div>

                  {/* Column 2 */}
                  <div className="veritas-menu-specials-col">
                    <a
                      href="mailto:theveritasbusiness@gmail.com"
                      onClick={() => setIsMenuOpen(false)}
                      className="veritas-menu-special-link"
                      role="menuitem"
                    >
                      <i className="fa fa-envelope" />
                      Contact Us
                    </a>
                    <a
                      href="mailto:advertise@theveritas.in"
                      onClick={() => setIsMenuOpen(false)}
                      className="veritas-menu-special-link"
                      role="menuitem"
                    >
                      <i className="fa fa-handshake-o" />
                      Advertise
                    </a>
                    <Link
                      to="/terms"
                      onClick={() => setIsMenuOpen(false)}
                      className="veritas-menu-special-link"
                      role="menuitem"
                    >
                      <i className="fa fa-gavel" />
                      Terms &amp; Conditions
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {children || <Outlet />}

      <footer className="veritas-footer">
        {/* Top band */}
        <div className="veritas-footer-top">
          <div className="veritas-footer-inner">

            {/* Logo + tagline + socials */}
            <div className="veritas-footer-brand">
              <Link to="/" aria-label="The Veritas homepage">
                <img src="/Full_Logo.png" alt="The Veritas" className="veritas-footer-logo" />
              </Link>
              <p className="veritas-footer-tagline">
                Where the truth speaks itself.
              </p>
              <p className="veritas-footer-mission">
                Independent journalism committed to fact-checked, fearless reporting across India and the world.
              </p>
              <div className="veritas-footer-socials">
                <a href="https://www.instagram.com/thedailyveritas/" target="_blank" rel="noreferrer noopener" aria-label="The Veritas on Instagram" className="veritas-social-icon">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><circle cx="12" cy="12" r="4.5" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
                </a>
                <a href="https://www.linkedin.com/company/theveritas/" target="_blank" rel="noreferrer noopener" aria-label="The Veritas on LinkedIn" className="veritas-social-icon">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
                </a>
                <a href="https://twitter.com/thedailyveritas" target="_blank" rel="noreferrer noopener" aria-label="The Veritas on X / Twitter" className="veritas-social-icon">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
                <a href="https://www.youtube.com/channel/UCD1zd5OIOBKFWEzi6CB25DQ" target="_blank" rel="noreferrer noopener" aria-label="The Veritas on YouTube" className="veritas-social-icon">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.94 1.96C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="black" /></svg>
                </a>
              </div>
            </div>

            {/* Section links */}
            <div className="veritas-footer-col">
              <h3 className="veritas-footer-col-heading">Sections</h3>
              <ul className="veritas-footer-links">
                {[
                  { label: "World", path: "/world" },
                  { label: "India", path: "/india" },
                  { label: "Politics", path: "/politics" },
                  { label: "Business", path: "/business" },
                  { label: "Science", path: "/science" },
                  { label: "Legal", path: "/legal" },
                  { label: "Lifestyle", path: "/lifestyle" },
                  { label: "Sports", path: "/sports" },
                ].map(({ label, path }) => (
                  <li key={label}>
                    <Link to={path} className="veritas-footer-link">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Features / specials */}
            <div className="veritas-footer-col">
              <h3 className="veritas-footer-col-heading">Features</h3>
              <ul className="veritas-footer-links">
                <li><Link to="/trending" className="veritas-footer-link">The Veritas Desk</Link></li>
                <li>
                  <a
                    href={LIVE_MONITOR_URL}
                    {...(isExternalLiveUrl ? { target: "_blank", rel: "noreferrer" } : {})}
                    className="veritas-footer-link veritas-footer-link--live"
                  >
                    <span className="veritas-footer-live-dot" aria-hidden="true" />
                    Live Monitor
                  </a>
                </li>
                <li><Link to="/?search=" className="veritas-footer-link">Search</Link></li>
              </ul>

              <h3 className="veritas-footer-col-heading" style={{ marginTop: "1.75rem" }}>Company</h3>
              <ul className="veritas-footer-links">
                <li><Link to="/about" className="veritas-footer-link">About Us</Link></li>
                <li><Link to="/about#team" className="veritas-footer-link">Our Team</Link></li>
                <li>
                  <a href="mailto:theveritasbusiness@gmail.com" className="veritas-footer-link">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="mailto:advertise@theveritas.in" className="veritas-footer-link">
                    Advertise
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter CTA */}
            <div className="veritas-footer-col veritas-footer-col--newsletter">
              <h3 className="veritas-footer-col-heading">Stay Informed</h3>
              <p className="veritas-footer-newsletter-copy">
                Get breaking news and in-depth analysis delivered to your inbox — no noise, just the stories that matter.
              </p>
              <form
                className="veritas-footer-newsletter-form"
                onSubmit={(e) => e.preventDefault()}
                aria-label="Newsletter signup"
              >
                <input
                  type="email"
                  placeholder="Your email address"
                  className="veritas-footer-newsletter-input"
                  aria-label="Email address for newsletter"
                  required
                />
                <button type="submit" className="veritas-footer-newsletter-btn">
                  Subscribe
                </button>
              </form>
              <p className="veritas-footer-newsletter-note">
                No spam. Unsubscribe anytime.
              </p>

              <div className="veritas-footer-contact-block">
                <a href="mailto:theveritasbusiness@gmail.com" className="veritas-footer-contact-link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                  theveritasbusiness@gmail.com
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="veritas-footer-bottom">
          <div className="veritas-footer-inner veritas-footer-bottom-inner">
            <p className="veritas-footer-copyright">
              © {new Date().getFullYear()} The Veritas. All rights reserved.
            </p>
            <nav aria-label="Legal links" className="veritas-footer-legal">
              <Link to="/privacy" className="veritas-footer-legal-link">Privacy Policy</Link>
              <span aria-hidden="true">·</span>
              <Link to="/terms" className="veritas-footer-legal-link">Terms &amp; Conditions</Link>
              <span aria-hidden="true">·</span>
              <Link to="/sitemap.xml" className="veritas-footer-legal-link">Sitemap</Link>
            </nav>
            <p className="veritas-footer-reg">
              Registered in India · New Delhi
            </p>
          </div>
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

/* ── FOOTER ─────────────────────────────────────────── */
.veritas-footer {
  background: #080808;
  border-top: 1px solid rgba(255,255,255,0.07);
  margin-top: 4rem;
}

.veritas-footer-inner {
  max-width: 72rem;
  margin: 0 auto;
  padding: 0 1.25rem;
}

/* Top section */
.veritas-footer-top {
  padding: 3.5rem 0 3rem;
}

.veritas-footer-top .veritas-footer-inner {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.6fr;
  gap: 3rem 2.5rem;
  align-items: start;
}

/* Brand column */
.veritas-footer-logo {
  height: 52px;
  width: auto;
  object-fit: contain;
  display: block;
  filter: brightness(0.92);
  transition: filter 0.2s ease;
}
.veritas-footer-logo:hover { filter: brightness(1); }

.veritas-footer-tagline {
  margin-top: 1.1rem;
  font-family: Georgia, 'Times New Roman', serif;
  font-style: italic;
  font-size: 0.95rem;
  color: rgba(255,255,255,0.7);
  line-height: 1.5;
}

.veritas-footer-mission {
  margin-top: 0.65rem;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.35);
  line-height: 1.7;
  max-width: 35ch;
}

/* Social buttons */
.veritas-footer-socials {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 1.4rem;
}

.veritas-social-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  color: rgba(255,255,255,0.5);
  transition: border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}
.veritas-social-icon:hover {
  border-color: var(--veritas-red);
  color: var(--veritas-red);
  transform: translateY(-2px);
}

/* Nav columns */
.veritas-footer-col-heading {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.3);
  margin-bottom: 1rem;
}

.veritas-footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.veritas-footer-link {
  font-size: 0.84rem;
  color: rgba(255,255,255,0.5);
  text-decoration: none;
  transition: color 0.16s;
}
.veritas-footer-link:hover { color: #fff; }

.veritas-footer-link--live {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.veritas-footer-live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--veritas-red);
  flex-shrink: 0;
  animation: liveBlink 1.05s ease-in-out infinite;
}

/* Newsletter column */
.veritas-footer-newsletter-copy {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.4);
  line-height: 1.7;
  margin-bottom: 1rem;
}

.veritas-footer-newsletter-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.veritas-footer-newsletter-input {
  width: 100%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 7px;
  padding: 0.6rem 0.85rem;
  font-size: 0.8rem;
  color: #fff;
  outline: none;
  transition: border-color 0.18s;
}
.veritas-footer-newsletter-input::placeholder { color: rgba(255,255,255,0.25); }
.veritas-footer-newsletter-input:focus { border-color: rgba(222,2,22,0.5); }

.veritas-footer-newsletter-btn {
  width: 100%;
  background: var(--veritas-red);
  border: none;
  border-radius: 7px;
  padding: 0.6rem;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #fff;
  cursor: pointer;
  transition: filter 0.18s, transform 0.18s;
}
.veritas-footer-newsletter-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.veritas-footer-newsletter-note {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.2);
  margin-top: 0.5rem;
}

.veritas-footer-contact-block {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.veritas-footer-contact-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 0.78rem;
  color: rgba(255,255,255,0.35);
  text-decoration: none;
  transition: color 0.16s;
}
.veritas-footer-contact-link:hover { color: rgba(255,255,255,0.75); }

/* Bottom bar */
.veritas-footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.05);
  padding: 1.1rem 0;
}

.veritas-footer-bottom-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
}

.veritas-footer-copyright {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.22);
  margin: 0;
}

.veritas-footer-legal {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.73rem;
  color: rgba(255,255,255,0.2);
}

.veritas-footer-legal-link {
  color: rgba(255,255,255,0.3);
  text-decoration: none;
  transition: color 0.16s;
}
.veritas-footer-legal-link:hover { color: rgba(255,255,255,0.65); }

.veritas-footer-reg {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.17);
  margin: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .veritas-footer-top .veritas-footer-inner {
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem 2rem;
  }
  .veritas-footer-col--newsletter { grid-column: span 2; }
  .veritas-footer-newsletter-form { flex-direction: row; }
  .veritas-footer-newsletter-btn { width: auto; padding: 0.6rem 1.25rem; white-space: nowrap; }
}

@media (max-width: 640px) {
  .veritas-footer-top { padding: 2.5rem 0 2rem; }
  .veritas-footer-top .veritas-footer-inner {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .veritas-footer-col--newsletter { grid-column: span 1; }
  .veritas-footer-newsletter-form { flex-direction: column; }
  .veritas-footer-newsletter-btn { width: 100%; }
  .veritas-footer-mission { max-width: 100%; }
  .veritas-footer-bottom-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .veritas-footer-legal { flex-wrap: wrap; }
}

/* Burger Icon and Mega Dropdown Menu */
.veritas-burger-icon {
  font-size: 1.25rem;
  font-weight: 900;
  display: inline-block;
  line-height: 1;
}

.veritas-menu-dropdown {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 24px);
  max-width: 820px;
  background: #0c0c0e;
  border: 1px solid #1f1f23;
  border-radius: 0 0 12px 12px;
  box-shadow: 
    0 20px 40px -15px rgba(0, 0, 0, 0.9),
    0 0 0 1px rgba(255, 255, 255, 0.02) inset;
  z-index: 100;
  animation: veritasMenuDropdownIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  padding: 1.75rem 2rem;
  pointer-events: auto;
}

@keyframes veritasMenuDropdownIn {
  from {
    opacity: 0;
    transform: translate(-50%, -8px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

.veritas-menu-dropdown-container {
  display: flex;
  gap: 1.25rem;
}

/* Left Section: Categories Grid */
.veritas-menu-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 2rem;
}

.veritas-menu-categories-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.85rem 1rem;
}

.veritas-menu-category-item {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 0.95rem;
  font-weight: 500;
  color: #e4e4e7;
  text-decoration: none;
  transition: color 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.veritas-menu-category-item:hover {
  color: var(--veritas-red);
}

/* Left Section Footer */
.veritas-menu-left-footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-top: 1px solid #1f1f23;
  padding-top: 1.25rem;
  flex-wrap: wrap;
}

.veritas-menu-connect-label {
  font-size: 0.8rem;
  color: #71717a;
  font-weight: 500;
}

.veritas-menu-socials {
  display: flex;
  gap: 0.5rem;
}

.veritas-menu-socials a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background: #18181b;
  color: #a1a1aa;
  transition: all 0.2s ease;
  text-decoration: none;
}

.veritas-menu-socials a:hover {
  background: #27272a;
  color: #ffffff;
}

.veritas-menu-socials a svg {
  display: block;
}

.veritas-menu-footer-divider {
  color: #27272a;
  font-size: 0.9rem;
}

.veritas-menu-footer-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: #ffffff;
  text-decoration: none;
  padding: 0.45rem 1.15rem;
  background: #de0216;
  border: 1px solid #de0216;
  border-radius: 6px;
  box-shadow: 0 0 10px rgba(222, 2, 22, 0.25);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.veritas-menu-footer-cta:hover {
  filter: brightness(1.12);
  box-shadow: 
    0 0 18px rgba(222, 2, 22, 0.45),
    0 2px 4px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}

/* Right Section: Specials Column */
.veritas-menu-right {
  width: 250px;
  border-left: 1px solid #1f1f23;
  padding-left: 1.25rem;
  flex-shrink: 0;
}

.veritas-menu-specials-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0 0.75rem;
}

.veritas-menu-specials-col {
  display: flex;
  flex-direction: column;
}

.veritas-menu-special-link {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: #a1a1aa;
  text-decoration: none;
  padding: 0.75rem 0;
  border-bottom: 1px solid #18181b;
  transition: all 0.2s ease;
}

.veritas-menu-special-link:hover {
  color: #ffffff;
}

.veritas-menu-special-link i {
  font-size: 0.95rem;
  color: #71717a;
  width: 16px;
  text-align: center;
  transition: color 0.2s ease;
}

.veritas-menu-special-link:hover i {
  color: var(--veritas-red);
}

/* Live Indicator Dot */
.veritas-menu-live-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
}

.veritas-menu-live-indicator-dot {
  width: 8px;
  height: 8px;
  background: var(--veritas-red);
  border-radius: 50%;
  animation: liveBlink 1.05s ease-in-out infinite;
}

/* Responsive Rules */
@media (max-width: 1024px) {
  .veritas-menu-right {
    width: 200px;
    padding-left: 1rem;
  }
}

@media (max-width: 768px) {
  .veritas-menu-dropdown {
    width: calc(100% - 16px);
    padding: 1.5rem;
  }
  .veritas-menu-dropdown-container {
    flex-direction: column;
    gap: 1.5rem;
  }
  .veritas-menu-categories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem 1rem;
  }
  .veritas-menu-right {
    width: 100%;
    border-left: none;
    padding-left: 0;
    border-top: 1px solid #1f1f23;
    padding-top: 1.5rem;
  }
  .veritas-menu-specials-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
      `}</style>
    </div>
  );
}