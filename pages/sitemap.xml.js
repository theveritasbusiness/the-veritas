import { API_BASE } from "../src/lib/env";

const SITE_URL = "https://www.theveritas.in";

const STATIC_PAGES = [
  { path: "/", changefreq: "hourly", priority: 1.0 },
  { path: "/trending", changefreq: "hourly", priority: 0.8 },
  { path: "/about", changefreq: "weekly", priority: 0.7 },
  { path: "/privacy", changefreq: "monthly", priority: 0.4 },
  { path: "/terms", changefreq: "monthly", priority: 0.4 },
  { path: "/world", changefreq: "daily", priority: 0.7 },
  { path: "/india", changefreq: "daily", priority: 0.7 },
  { path: "/politics", changefreq: "daily", priority: 0.7 },
  { path: "/business", changefreq: "daily", priority: 0.7 },
  { path: "/markets", changefreq: "daily", priority: 0.7 },
  { path: "/science", changefreq: "daily", priority: 0.7 },
  { path: "/legal", changefreq: "daily", priority: 0.7 },
  { path: "/lifestyle", changefreq: "daily", priority: 0.7 },
  { path: "/sports", changefreq: "daily", priority: 0.7 }
];

const AUTHOR_SLUGS = [
  "kavye-singhal",
  "soumyadeep-mondal",
  "tavisha-kaushik",
  "sidharth-sharma",
  "nitanshu-jain",
  "the-veritas-bureau",
  "the-veritas-desk"
];

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatLastMod(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

async function fetchArticles() {
  const response = await fetch(`${API_BASE}/articles?summary=1`, {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Sitemap fetch failed: ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

function buildUrlEntry({ loc, changefreq, priority, lastmod }) {
  const lines = [
    "  <url>",
    `    <loc>${xmlEscape(loc)}</loc>`,
    lastmod ? `    <lastmod>${xmlEscape(lastmod)}</lastmod>` : "",
    changefreq ? `    <changefreq>${xmlEscape(changefreq)}</changefreq>` : "",
    typeof priority === "number"
      ? `    <priority>${priority.toFixed(1)}</priority>`
      : "",
    "  </url>"
  ];

  return lines.filter(Boolean).join("\n");
}

export async function getServerSideProps({ res }) {
  let articles = [];

  try {
    articles = await fetchArticles();
  } catch (error) {
    console.warn("Sitemap fetch failed:", error.message);
  }

  const staticEntries = STATIC_PAGES.map((page) =>
    buildUrlEntry({
      loc: new URL(page.path, SITE_URL).toString(),
      changefreq: page.changefreq,
      priority: page.priority
    })
  );

  const authorEntries = AUTHOR_SLUGS.map((slug) =>
    buildUrlEntry({
      loc: new URL(`/authors/${slug}`, SITE_URL).toString(),
      changefreq: "weekly",
      priority: 0.5
    })
  );

  const articleEntries = articles
    .map((article) => {
      const slug = String(article?.slug || "").trim();
      if (!slug || slug.length > 200) {
        return "";
      }

      return buildUrlEntry({
        loc: new URL(`/article/${slug}`, SITE_URL).toString(),
        changefreq: "daily",
        priority: 0.7,
        lastmod: formatLastMod(article?.published_at)
      });
    })
    .filter(Boolean);

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...staticEntries,
    ...authorEntries,
    ...articleEntries,
    "</urlset>"
  ].join("\n");

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
  res.write(xml);
  res.end();

  return { props: {} };
}

export default function Sitemap() {
  return null;
}