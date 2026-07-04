export function slugifyAuthor(name = "") {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function getAuthorInitials(name = "") {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "TV";
  }

  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
}

const KNOWN_AUTHORS = {
  [slugifyAuthor("Kavya Singhal")]: {
    name: "Kavya Singhal",
    role: "Founder & CEO",
    linkedin: "https://www.linkedin.com/in/kavye-singhal-40237a403/",
    bio: "Kavya Singhal leads The Veritas with a vision for impactful journalism, public trust, and long-term editorial growth.",
    image: "/Kavya.PNG",
    lead: true
  },
  [slugifyAuthor("Soumyadeep Mondal")]: {
    name: "Soumyadeep Mondal",
    role: "Co-Founder & CAO",
    linkedin: "https://www.linkedin.com/in/soumyadeep-mondal-01a21b3a5/",
    bio: "Soumyadeep Mondal is the Co-founder and Chief Administrative Officer of The Veritas, managing the organization's operations and administrative functions.",
    image: "/Soumyadeep.jpeg",
    lead: true
  },
  [slugifyAuthor("Sidharth Sharma")]: {
    name: "Sidharth Sharma",
    role: "CTO",
    linkedin: "https://www.linkedin.com/in/siddy-kahanikaar/",
    bio: "Sidharth Sharma is the Chief Technology Officer of The Veritas, driving the organization's digital innovation and technical strategy.",
    image: "/Sidharth.png.png",
    lead: true
  },
  [slugifyAuthor("Tavisha Kaushik")]: {
    name: "Tavisha Kaushik",
    role: "Editor in Chief & CMO",
    linkedin: "https://www.linkedin.com/in/tavisha-kaushik-975a91315/",
    bio: "Tavisha Kaushik leads The Veritas newsroom with a sharp editorial eye, overseeing the publication's news direction, editorial standards, and long-form coverage priorities.",
    image: "/Tavisha.jpeg",
    lead: true
  },
  [slugifyAuthor("Sumit Bhatt")]: {
    name: "Sumit Bhatt",
    role: "Chief Developer",
    linkedin: "https://www.linkedin.com/in/sumit-bhatt-753186218/",
    bio: "Sumit Bhatt leads core development work at The Veritas, strengthening the platform, publishing tools, and product reliability across the newsroom stack.",
    image: "/Sumit.jpeg"
  },
  [slugifyAuthor("Alisha")]: {
    name: "Alisha",
    role: "Editor",
    linkedin: "",
    bio: "Alisha contributes to The Veritas with editorial judgment, newsroom coordination, and publication support across evolving stories.",
    image: "/Alisha_The-Veritas.png"
  },
  [slugifyAuthor("Madhvi")]: {
    name: "Madhvi",
    role: "Editor",
    linkedin: "",
    bio: "Madhvi contributes to The Veritas with editorial support, reporting inputs, and category-specific newsroom work.",
    image: null
  },
  [slugifyAuthor("The Veritas Bureau")]: {
    name: "The Veritas Bureau",
    role: "Editorial Bureau",
    linkedin: "",
    bio: "The Veritas Bureau represents collaborative reporting from the wider newsroom, bringing together research, desk analysis, and on-ground inputs into unified coverage.",
    image: null
  },
  [slugifyAuthor("The Veritas Desk")]: {
    name: "The Veritas Desk",
    role: "Editorial Desk",
    linkedin: "",
    bio: "The Veritas Desk curates major developments, publishes desk-led explainers, and drives editorial coverage across categories and breaking stories.",
    image: null
  }
};

const AUTHOR_ALIASES = {
  [slugifyAuthor("Kavye Singhal")]: slugifyAuthor("Kavya Singhal"),
  [slugifyAuthor("Soumyadeep Mondl")]: slugifyAuthor("Soumyadeep Mondal"),
  [slugifyAuthor("Tavisha Kausik")]: slugifyAuthor("Tavisha Kaushik"),
  [slugifyAuthor("Madvie")]: slugifyAuthor("Madhvi")
};

const ABOUT_VISIBLE_ORDER = [
  slugifyAuthor("Kavya Singhal"),
  slugifyAuthor("Soumyadeep Mondal"),
  slugifyAuthor("Tavisha Kaushik"),
  slugifyAuthor("Sidharth Sharma"),
  slugifyAuthor("Sumit Bhatt"),
  slugifyAuthor("Alisha"),
  slugifyAuthor("Madhvi")
];

const DEFAULT_PROFILE_ORDER = [
  ...ABOUT_VISIBLE_ORDER,
  slugifyAuthor("The Veritas Bureau"),
  slugifyAuthor("The Veritas Desk")
];

export function getAuthorProfile(name = "") {
  const cleanName = String(name || "").trim() || "The Veritas Desk";
  const rawSlug = slugifyAuthor(cleanName);
  const slug = AUTHOR_ALIASES[rawSlug] || rawSlug;
  const known = KNOWN_AUTHORS[slug];

  if (known) {
    return {
      slug,
      initials: getAuthorInitials(known.name),
      ...known
    };
  }

  return {
    slug,
    name: cleanName,
    role: "Contributor",
    linkedin: "",
    bio: `${cleanName} contributes to The Veritas reporting across evolving stories, analysis, and category-specific coverage.`,
    image: null,
    initials: getAuthorInitials(cleanName)
  };
}

export function collectAuthorProfiles(articles = []) {
  const seen = new Map();

  for (const article of articles) {
    const profile = getAuthorProfile(article.author_name || "The Veritas Desk");
    if (!seen.has(profile.slug)) {
      seen.set(profile.slug, profile);
    }
  }

  return Array.from(seen.values()).sort((a, b) => {
    const orderA = DEFAULT_PROFILE_ORDER.indexOf(a.slug);
    const orderB = DEFAULT_PROFILE_ORDER.indexOf(b.slug);

    if (orderA !== -1 || orderB !== -1) {
      return (orderA === -1 ? 999 : orderA) - (orderB === -1 ? 999 : orderB);
    }

    return a.name.localeCompare(b.name);
  });
}

export function getFeaturedTeamProfiles() {
  return ABOUT_VISIBLE_ORDER.map((slug) => {
    const profile = KNOWN_AUTHORS[slug];
    return profile
      ? {
          slug,
          initials: getAuthorInitials(profile.name),
          ...profile
        }
      : null;
  }).filter(Boolean);
}
