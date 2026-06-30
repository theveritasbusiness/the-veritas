import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate, useSearchParams } from "../lib/router";
import { LIVE_MONITOR_URL } from "../api";
import { getCategoryPath } from "../content/categories";

const categories = [
  "Home",
  "World",
  "India",
  "The Veritas Desk",
  "Politics",
  "Markets",
  "Tech",
  "Legal",
  "Lifestyle",
  "Sports",
  "About Us"
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category");
  const querySearch = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(querySearch);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
            {/* Burger Menu Button (Only icon, clean & bold) */}
            <li
              className="cursor-pointer transition-colors text-white/90 hover:text-[var(--veritas-red)] flex items-center pr-1.5"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open navigation menu"
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
      </nav>

      {children || <Outlet />}

      <footer className="veritas-footer">
        {/* Top band */}
        <div className="veritas-footer-top">
          <div className="veritas-footer-inner">

            {/* Logo + tagline + socials */}
            <div className="veritas-footer-brand">
              <Link to="/" aria-label="The Veritas homepage">
                <img src="/Logo_Edit_4.png" alt="The Veritas" className="veritas-footer-logo" />
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

/* Drawer & Burger Animations */
@keyframes veritasSlideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}
.veritas-animate-slide-in {
  animation: veritasSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.veritas-burger-icon {
  font-size: 1.25rem;
  font-weight: 900;
  display: inline-block;
  line-height: 1;
}

/* Custom scrollbar hiding for drawer contents */
.drawer-no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.drawer-no-scrollbar::-webkit-scrollbar {
  display: none;
}
      `}</style>

      {/* Slide-out Navigation Drawer */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Drawer content panel */}
          <div
            className="relative w-full max-w-sm sm:max-w-md bg-neutral-950 border-r border-neutral-800 h-full flex flex-col justify-between shadow-2xl z-10 transition-transform duration-300 veritas-animate-slide-in mr-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-900">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center">
                <img
                  src="/Logo_Edit_4.png"
                  alt="The Veritas"
                  className="h-10 w-auto object-contain"
                />
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-neutral-400 hover:text-white transition-colors p-2 -mr-2"
                aria-label="Close menu"
              >
                <i className="fa fa-times text-xl" />
              </button>
            </div>

            {/* Scrollable Categories List */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 drawer-no-scrollbar">
              {/* Menu Sections (Expanded) */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 mb-4">
                  Featured Sections
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      label: "Environment & Climate",
                      path: "/environment-climate",
                      desc: "Ecology, policy, sustainability"
                    },
                    {
                      label: "Society & Culture",
                      path: "/society-culture",
                      desc: "Social movements, lifestyle, human interest"
                    },
                    {
                      label: "Editorials",
                      path: "/editorials",
                      desc: "Columns, op-eds, commentary"
                    },
                    {
                      label: "The Veritas Explains",
                      path: "/the-veritas-explains",
                      desc: "In-depth explanations of complex issues"
                    },
                    {
                      label: "Health",
                      path: "/health",
                      desc: "Public health, medicine, policy"
                    },
                    {
                      label: "Business, Economy",
                      path: "/markets",
                      desc: "Markets, company moves, financial analysis"
                    }
                  ].map((sec) => (
                    <Link
                      key={sec.label}
                      to={sec.path}
                      onClick={() => setIsMenuOpen(false)}
                      className="group block p-3.5 rounded-lg bg-neutral-900/40 hover:bg-neutral-900 border border-neutral-900 hover:border-neutral-800 transition-all duration-200"
                    >
                      <div className="font-serif text-base text-neutral-100 group-hover:text-[var(--veritas-red)] transition-colors">
                        {sec.label}
                      </div>
                      <div className="text-xs text-neutral-400 mt-1 font-sans">
                        {sec.desc}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* All Sections Directory */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 mb-4">
                  All Sections
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Home", path: "/" },
                    { label: "The Veritas Desk", path: "/trending" },
                    { label: "World", path: "/world" },
                    { label: "India", path: "/india" },
                    { label: "Politics", path: "/politics" },
                    { label: "Tech", path: "/tech" },
                    { label: "Legal", path: "/legal" },
                    { label: "Lifestyle", path: "/lifestyle" },
                    { label: "Sports", path: "/sports" },
                    { label: "About Us", path: "/about" }
                  ].map((sec) => (
                    <Link
                      key={sec.label}
                      to={sec.path}
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-2 px-3 text-sm text-neutral-300 hover:text-white hover:bg-neutral-900 rounded transition-colors font-sans"
                    >
                      {sec.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer inside drawer */}
            <div className="p-6 border-t border-neutral-900 bg-neutral-950/80">
              <div className="text-[10px] text-neutral-500 text-center font-sans">
                © {new Date().getFullYear()} The Veritas. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}