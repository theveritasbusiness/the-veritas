export const CATEGORY_CONFIG = [
  {
    name: "World",
    slug: "world",
    title: "World News",
    description:
      "Global affairs, geopolitics, diplomacy, and international developments reported with context by The Veritas."
  },
  {
    name: "India",
    slug: "india",
    title: "India News",
    description:
      "Reporting on India covering policy, politics, public life, institutions, and stories shaping the country."
  },
  {
    name: "Politics",
    slug: "politics",
    title: "Politics News",
    description:
      "Political reporting, power shifts, elections, governance, and accountability journalism from The Veritas."
  },
  {
    name: "Business",
    slug: "business",
    title: "Business News",
    description:
      "Business, markets, economy, company moves, and analysis of financial developments that matter."
  },
  {
    name: "Science",
    slug: "science",
    title: "Science News",
    description:
      "Science, technology, research, and discovery explained with clarity and editorial depth."
  },
  {
    name: "Legal",
    slug: "legal",
    title: "Legal News",
    description:
      "Courts, constitutional matters, legal affairs, judgments, and justice-focused reporting from The Veritas."
  },
  {
    name: "Lifestyle",
    slug: "lifestyle",
    title: "Lifestyle News",
    description:
      "Lifestyle, culture, society, and the human stories that shape everyday life and public conversation."
  },
  {
    name: "Sports",
    slug: "sports",
    title: "Sports News",
    description:
      "Sports coverage, athlete stories, competitions, and informed analysis from The Veritas newsroom."
  }
];

export function getCategoryConfigBySlug(slug = "") {
  return CATEGORY_CONFIG.find((category) => category.slug === String(slug || "").toLowerCase()) || null;
}

export function getCategoryConfigByName(name = "") {
  const normalizedName = String(name || "").trim().toLowerCase();
  return CATEGORY_CONFIG.find((category) => category.name.toLowerCase() === normalizedName) || null;
}

export function getCategoryPath(nameOrSlug = "") {
  const byName = getCategoryConfigByName(nameOrSlug);
  if (byName) return `/${byName.slug}`;

  const bySlug = getCategoryConfigBySlug(nameOrSlug);
  if (bySlug) return `/${bySlug.slug}`;

  return "/";
}
