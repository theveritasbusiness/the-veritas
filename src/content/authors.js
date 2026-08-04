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
    role: "Founder & Chief Executive Officer",
    linkedin: "https://www.linkedin.com/in/kavye-singhal-40237a403/",
    bio: "Kavye Singhal leads The Veritas with a vision for impactful journalism, public trust, and long-term editorial growth.",
    image: "/Kavya.PNG",
    lead: true
  },
  [slugifyAuthor("Soumyadeep Mondal")]: {
    name: "Soumyadeep Mondal",
    role: "Co-Founder & Chief Administrative Officer",
    linkedin: "https://www.linkedin.com/in/soumyadeep-mondal-01a21b3a5/",
    bio: "Soumyadeep Mondal is the Co-founder and Chief Administrative Officer of The Veritas, managing the organization's operations and administrative functions.",
    image: "/Soumyadeep.jpeg",
    lead: true
  },
  [slugifyAuthor("Sidharth Sharma")]: {
    name: "Sidharth Sharma",
    role: "Chief Technology Officer",
    linkedin: "https://www.linkedin.com/in/siddy-kahanikaar/",
    bio: "Sidharth Sharma is the Chief Technology Officer of The Veritas, driving the organization's digital innovation and technical strategy.",
    image: "/Sidharth.png.png",
    lead: true
  },
  [slugifyAuthor("Tavisha Kaushik")]: {
    name: "Tavisha Kaushik",
    role: "Editor in Chief & Chief Marketing Officer",
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
  [slugifyAuthor("Madhavi")]: {
    name: "Madhavi",
    role: "News Correspondent",
    linkedin: "",
    bio: "Madhavi contributes to The Veritas through ground reporting, developing stories, and newsroom inputs across key coverage areas.",
    image: null
  },
  [slugifyAuthor("Debadrita Dey")]: {
    name: "Debadrita Dey",
    role: "News Correspondent",
    linkedin: "",
    bio: "Debadrita Dey contributes to The Veritas through reporting support, field-driven updates, and developing news coverage.",
    image: null
  },
  [slugifyAuthor("Yashwardhan")]: {
    name: "Yashwardhan",
    role: "News Correspondent",
    linkedin: "",
    bio: "Yashwardhan contributes to The Veritas through developing reports, field inputs, and evolving story coverage.",
    image: null
  },
  [slugifyAuthor("Alisha Chawla")]: {
    name: "Alisha Chawla",
    role: "Sports Correspondent",
    linkedin: "",
    bio: "Alisha Chawla contributes to The Veritas with sports reporting, match coverage, and timely updates across the sports desk.",
    image: "/Alisha_The-Veritas.png"
  },
  [slugifyAuthor("Madhvi")]: {
    name: "Madhvi",
    role: "News Correspondent",
    linkedin: "",
    bio: "Madhvi contributes to The Veritas through ground reporting, developing stories, and newsroom inputs across key coverage areas.",
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
  [slugifyAuthor("Kavya Singhal")]: slugifyAuthor("Kavye Singhal"),
  [slugifyAuthor("Kavye Singhal")]: slugifyAuthor("Kavye Singhal"),
  [slugifyAuthor("Soumyadeep Mondl")]: slugifyAuthor("Soumyadeep Mondal"),
  [slugifyAuthor("Tavisha Kausik")]: slugifyAuthor("Tavisha Kaushik"),
  [slugifyAuthor("Madvie")]: slugifyAuthor("Madhavi"),
  [slugifyAuthor("Madhvi")]: slugifyAuthor("Madhavi"),
  [slugifyAuthor("Alisha")]: slugifyAuthor("Alisha Chawla")
};

const ABOUT_VISIBLE_ORDER = [
  slugifyAuthor("Kavye Singhal"),
  slugifyAuthor("Soumyadeep Mondal"),
  slugifyAuthor("Sidharth Sharma"),
  slugifyAuthor("Tavisha Kaushik"),
  slugifyAuthor("Sumit Bhatt"),
  slugifyAuthor("Madhavi"),
  slugifyAuthor("Debadrita Dey"),
  slugifyAuthor("Yashwardhan"),
  slugifyAuthor("Alisha Chawla")
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
