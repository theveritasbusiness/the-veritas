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
  [slugifyAuthor("Kavye Singhal")]: {
    name: "Kavye Singhal",
    role: "Founder and Chief Executive Officer",
    linkedin: "https://www.linkedin.com/in/kavye-singhal-40237a403/",
    bio: "Kavye Singhal is the Founder and Chief Executive Officer of The Veritas, leading the organization with a vision for impactful journalism.",
    image: null
  },
  [slugifyAuthor("Soumyadeep Mondal")]: {
    name: "Soumyadeep Mondal",
    role: "Co-founder and Chief Administrative Officer",
    linkedin: "https://www.linkedin.com/in/soumyadeep-mondal-01a21b3a5/",
    bio: "Soumyadeep Mondal is the Co-founder and Chief Administrative Officer of The Veritas, managing the organization's operations and administrative functions.",
    image: "/Soumyadeep.jpeg"
  },
  [slugifyAuthor("Sidharth Sharma")]: {
    name: "Sidharth Sharma",
    role: "Chief Technology Officer",
    linkedin: "https://www.linkedin.com/in/sidharth-sharma-9392853b5/",
    bio: "Sidharth Sharma is the Chief Technology Officer of The Veritas, driving the organization's digital innovation and technical strategy.",
    image: null

  },
  [slugifyAuthor("Tavisha Kaushik")]: {
    name: "Tavisha Kaushik",
    role: "Editor-in-Chief",
    linkedin: "https://www.linkedin.com/in/tavisha-kaushik-975a91315/",
    bio: "Tavisha Kaushik leads The Veritas newsroom with a sharp editorial eye, overseeing the publication’s news direction, editorial standards, and long-form coverage priorities.",
    image: "/Tavisha.jpeg"
  },
  [slugifyAuthor("Nitanshu Jain")]: {
    name: "Nitanshu Jain",
    role: "News Presenter and Editor",
    linkedin: "https://www.linkedin.com/in/nitanshu-jain-9392853b5/",
    bio: "Nitanshu Jain presents and shapes The Veritas reporting with a focus on clarity, delivery, and audience-facing journalism across fast-moving stories.",
    image: "/Nitanshu.png"
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

export function getAuthorProfile(name = "") {
  const cleanName = String(name || "").trim() || "The Veritas Desk";
  const slug = slugifyAuthor(cleanName);
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

  const preferredOrder = [
    slugifyAuthor("Kavye Singhal"),
    slugifyAuthor("Soumyadeep Mondal"),
    slugifyAuthor("Sidharth Sharma"),
    slugifyAuthor("Tavisha Kaushik"),
    slugifyAuthor("Nitanshu Jain"),
    slugifyAuthor("The Veritas Bureau"),
    slugifyAuthor("The Veritas Desk")
  ];

  return Array.from(seen.values()).sort((a, b) => {
    const orderA = preferredOrder.indexOf(a.slug);
    const orderB = preferredOrder.indexOf(b.slug);

    if (orderA !== -1 || orderB !== -1) {
      return (orderA === -1 ? 999 : orderA) - (orderB === -1 ? 999 : orderB);
    }

    return a.name.localeCompare(b.name);
  });
}
