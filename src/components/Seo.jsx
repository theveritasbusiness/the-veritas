import Head from "next/head";

const SITE_NAME = "The Veritas";
const SITE_URL = "https://www.theveritas.in";
const DEFAULT_IMAGE = `${SITE_URL}/LOGO.jpeg`;

export default function Seo({
  title,
  description,
  path = "/",
  image = DEFAULT_IMAGE,
  type = "website",
  robots = "index,follow",
  structuredData = [],
  absoluteTitle = false,
  keywords = [],
  tags = []
}) {
  const fullTitle = absoluteTitle
    ? (title || SITE_NAME)
    : title
      ? `${title} | ${SITE_NAME}`
      : SITE_NAME;
  const canonical = new URL(path, SITE_URL).toString();
  const resolvedImage = image || DEFAULT_IMAGE;
  const keywordList = Array.isArray(keywords)
    ? keywords.filter(Boolean)
    : String(keywords || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
  const tagList = Array.isArray(tags)
    ? tags.filter(Boolean)
    : String(tags || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
  const schemas = Array.isArray(structuredData)
    ? structuredData.filter(Boolean)
    : [structuredData].filter(Boolean);

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywordList.length > 0 ? (
        <meta name="keywords" content={keywordList.join(", ")} />
      ) : null}
      <meta name="robots" content={robots} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={resolvedImage} />
      {tagList.map((tag) => (
        <meta key={`article-tag-${tag}`} property="article:tag" content={tag} />
      ))}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={resolvedImage} />
      <link rel="canonical" href={canonical} />
      {schemas.map((schema, index) => (
        <script
          key={`schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </Head>
  );
}
