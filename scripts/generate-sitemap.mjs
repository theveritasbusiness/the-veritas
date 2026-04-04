import { writeFile } from "node:fs/promises";

const SITE_URL = "https://www.theveritas.in";
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.VITE_API_BASE ||
  "https://veritas-backend-dktb.onrender.com";
const OUTPUT_PATH = new URL("../public/sitemap.xml", import.meta.url);

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
  routeEntry("/live", "hourly", "0.9"),
  routeEntry("/trending", "hourly", "0.8"),
  routeEntry("/privacy", "monthly", "0.4"),
  routeEntry("/terms", "monthly", "0.4")
];

const articles = await fetchArticles();
const articleRoutes = articles
  .filter((article) => article?.slug)
  .map((article) =>
    routeEntry(
      `/article/${article.slug}`,
      "daily",
      "0.7",
      article.published_at ? new Date(article.published_at).toISOString() : undefined
    )
  );

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...staticRoutes,
  ...articleRoutes,
  "</urlset>"
].join("\n");

await writeFile(OUTPUT_PATH, sitemap, "utf8");
console.log(`Generated sitemap with ${staticRoutes.length + articleRoutes.length} URLs.`);
