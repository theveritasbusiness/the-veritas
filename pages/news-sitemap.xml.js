import { API_BASE } from "../src/lib/env";

const SITE_URL = "https://www.theveritas.in";
const PUBLICATION_NAME = "The Veritas";
const PUBLICATION_LANGUAGE = "en";
const IST_OFFSET_MINUTES = 330;

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatNewsDate(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }

  const istDate = new Date(date.getTime() + IST_OFFSET_MINUTES * 60 * 1000);
  const year = istDate.getUTCFullYear();
  const month = String(istDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(istDate.getUTCDate()).padStart(2, "0");
  const hours = String(istDate.getUTCHours()).padStart(2, "0");
  const minutes = String(istDate.getUTCMinutes()).padStart(2, "0");
  const seconds = String(istDate.getUTCSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+05:30`;
}

async function fetchNewsArticles() {
  const response = await fetch(`${API_BASE}/articles/news-sitemap`, {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`News sitemap fetch failed: ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

function buildUrlEntry(article) {
  const slug = String(article?.slug || "").trim();
  const title = String(article?.title || "").trim();
  const publishedDate = formatNewsDate(article?.published_at);

  if (!slug || !title || !publishedDate) {
    return "";
  }

  const loc = new URL(`/article/${slug}`, SITE_URL).toString();

  return [
    "  <url>",
    `    <loc>${xmlEscape(loc)}</loc>`,
    "    <news:news>",
    "      <news:publication>",
    `        <news:name>${xmlEscape(PUBLICATION_NAME)}</news:name>`,
    `        <news:language>${xmlEscape(PUBLICATION_LANGUAGE)}</news:language>`,
    "      </news:publication>",
    `      <news:publication_date>${xmlEscape(publishedDate)}</news:publication_date>`,
    `      <news:title>${xmlEscape(title)}</news:title>`,
    "    </news:news>",
    "  </url>"
  ].join("\n");
}

export async function getServerSideProps({ res }) {
  let articles = [];

  try {
    articles = await fetchNewsArticles();
  } catch (error) {
    console.warn("News sitemap feed failed:", error.message);
  }

  const urlEntries = articles
    .slice(0, 1000)
    .map((article) => buildUrlEntry(article))
    .filter(Boolean);

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">',
    ...urlEntries,
    "</urlset>"
  ].join("\n");

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
  res.write(xml);
  res.end();

  return { props: {} };
}

export default function NewsSitemap() {
  return null;
}