import { writeFile } from "node:fs/promises";

const SITE_URL = "https://www.theveritas.in";
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.VITE_API_BASE ||
  "https://veritas-backend-dktb.onrender.com";
const OUTPUT_PATH = new URL("../public/sitemap.xml", import.meta.url);
const CATEGORY_SLUGS = ["world", "india", "politics", "business", "science", "legal", "lifestyle", "sports"];
const FEATURED_AUTHOR_SLUGS = [
  "kavye-singhal",
  "soumyadeep-mondal",
  "tavisha-kaushik",
  "sidharth-sharma",
  "nitanshu-jain",
  "the-veritas-bureau",
  "the-veritas-desk"
];

function cleanArticleSlug(slug) {
  return String(slug || "").trim().replace(/-\d{10,}$/, "");
}

function slugifyAuthor(name = "") {
  return String(name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function routeEntry(path, changefreq, priority, lastmod) {
  return [
    "  <url>",
    `    <loc>${xmlEscape(new URL(path, SITE_URL).toString())}</loc>`,
    lastmod ? `    <lastmod>${xmlEscape(lastmod)}</lastmod>` : "",
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>"
  ]
    .filter(Boolean)
    .join("\n");
}

async function fetchArticles() {
  try {
    const response = await fetch(`${API_BASE}/articles`);
    if (!response.ok) {
      throw new Error(`Failed to fetch article sitemap source: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("Sitemap generation falling back to static routes only:", error.message);
    return [];
  }
}

const staticRoutes = [
  routeEntry("/", "hourly", "1.0"),
  routeEntry("/trending", "hourly", "0.8"),
  routeEntry("/about", "weekly", "0.7"),
  routeEntry("/privacy", "monthly", "0.4"),
  routeEntry("/terms", "monthly", "0.4")
];

const categoryRoutes = CATEGORY_SLUGS.map((slug) => routeEntry(`/${slug}`, "daily", "0.7"));

const articles = await fetchArticles();
const articleRoutes = Array.from(
  new Map(
    articles
      .filter((article) => article?.slug)
      .map((article) => [
        cleanArticleSlug(article.slug),
        routeEntry(
          `/article/${cleanArticleSlug(article.slug)}`,
          "daily",
          "0.7",
          article.published_at ? new Date(article.published_at).toISOString() : undefined
        )
      ])
  ).values()
);

const authorRoutes = Array.from(
  new Set(
    [...FEATURED_AUTHOR_SLUGS, ...articles.map((article) => slugifyAuthor(article?.author_name || ""))]
      .filter(Boolean)
      .map((slug) => routeEntry(`/authors/${slug}`, "weekly", "0.5"))
  )
);

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...staticRoutes,
  ...categoryRoutes,
  ...articleRoutes,
  ...authorRoutes,
  "</urlset>"
].join("\n");

await writeFile(OUTPUT_PATH, sitemap, "utf8");
console.log(
  `Generated sitemap with ${staticRoutes.length + categoryRoutes.length + articleRoutes.length + authorRoutes.length} URLs.`
);
