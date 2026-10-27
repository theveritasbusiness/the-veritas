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
      "Business, corporate updates, economic policies, and financial news reported by The Veritas."
  },
  {
    name: "Markets",
    slug: "markets",
    title: "Markets News",
    description:
      "Business, markets, economy, company moves, and analysis of financial developments that matter."
  },
  {
    name: "Tech",
    slug: "tech",
    title: "Tech News",
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
  },
  {
    name: "Environment & Climate",
    slug: "environment-climate",
    title: "Environment & Climate",
    description: "Ecology, policy, sustainability"
  },
  {
    name: "Society & Culture",
    slug: "society-culture",
    title: "Society & Culture",
    description: "Social movements, lifestyle, human interest"
  },
  {
    name: "Editorials",
    slug: "editorials",
    title: "Editorials",
    description: "Columns, op-eds, commentary"
  },
  {
    name: "The Veritas Explains",
    slug: "the-veritas-explains",
    title: "The Veritas Explains",
    description: "In-depth explanations of complex issues from The Veritas."
  },
  {
    name: "Health",
    slug: "health",
    title: "Health",
    description: "Public health, medicine, policy"
  }
];

export function isCategoryMatch(catA = "", catB = "") {
  const normA = String(catA || "").trim().toLowerCase();
  const normB = String(catB || "").trim().toLowerCase();

  if (normA === normB) return true;

  const businessGroup = ["business", "business, economy", "business & economy"];
  if (businessGroup.includes(normA) && businessGroup.includes(normB)) return true;

  const marketGroup = ["markets", "market"];
  if (marketGroup.includes(normA) && marketGroup.includes(normB)) return true;

  const scienceGroup = ["science", "tech", "science & technology"];
  if (scienceGroup.includes(normA) && scienceGroup.includes(normB)) return true;

  return false;
}

export function getCategoryConfigBySlug(slug = "") {
  const targetSlug = String(slug || "").toLowerCase();
  // Handle slug compatibility for routing / redirects if needed
  let normalizedSlug = targetSlug;
  if (targetSlug === "science") normalizedSlug = "tech";
  
  return CATEGORY_CONFIG.find((category) => category.slug === normalizedSlug) || null;
}

export function getCategoryConfigByName(name = "") {
  const normalizedName = String(name || "").trim().toLowerCase();
  return CATEGORY_CONFIG.find((category) => isCategoryMatch(category.name, normalizedName)) || null;
}

export function getCategoryPath(nameOrSlug = "") {
  const byName = getCategoryConfigByName(nameOrSlug);
  if (byName) return `/${byName.slug}`;

  const bySlug = getCategoryConfigBySlug(nameOrSlug);
  if (bySlug) return `/${bySlug.slug}`;

  return "/";
}

// "Read More" under an article: the latest few stories from the same category,
// excluding the article itself. Runs server-side over the article list the page
// already fetches (sorted newest/priority first), so it adds no request.
export function buildReadMore(articles = [], currentArticle = null, limit = 3) {
  const category = String(currentArticle?.category || "").trim();
  if (!category) return [];

  return articles
    .filter(
      (article) =>
        article.slug !== currentArticle.slug && isCategoryMatch(article.category, category)
    )
    .slice(0, limit)
    .map((article) => ({
      id: article.id ?? null,
      title: article.title || "",
      slug: article.slug || "",
      category: article.category || "",
      subheadline: article.subheadline || "",
      author_name: article.author_name || "",
      published_at: article.published_at || null,
      live_updated_at: article.live_updated_at || null,
      is_live: Boolean(article.is_live),
      is_editorial: Boolean(article.is_editorial),
      hero_image: article.hero_image || null,
      hero_focus: article.hero_focus || null,
      hero_crop: article.hero_crop || null
    }));
}
