import express from "express";
import pool from "../db.js";
import { requireAuth } from "../auth.js";

const router = express.Router();
let articleColumnsPromise = null;

async function getArticleColumns() {
  if (!articleColumnsPromise) {
    articleColumnsPromise = pool
      .query(
        `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'articles'
        `
      )
      .then((result) => new Set(result.rows.map((row) => row.column_name)))
      .catch((error) => {
        articleColumnsPromise = null;
        throw error;
      });
  }

  return articleColumnsPromise;
}

function hasColumn(columns, name) {
  return columns.has(name);
}

async function ensureArticleColumn(name, sqlType) {
  const columns = await getArticleColumns();
  if (hasColumn(columns, name)) {
    return columns;
  }

  await pool.query(`ALTER TABLE articles ADD COLUMN IF NOT EXISTS ${name} ${sqlType}`);
  articleColumnsPromise = null;
  return getArticleColumns();
}

function isTruthy(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    return ["true", "t", "1", "yes", "y"].includes(value.trim().toLowerCase());
  }
  return false;
}

function cleanArticleSlug(slug) {
  return String(slug || "")
    .trim()
    .replace(/-\d{10,}$/, "");
}

function isFalsy(value) {
  if (value == null) return false;
  if (typeof value === "boolean") return value === false;
  if (typeof value === "number") return value === 0;
  if (typeof value === "string") {
    return ["false", "f", "0", "no", "n"].includes(value.trim().toLowerCase());
  }
  return false;
}

function parseTimestamp(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function computePublishedAgo(publishedAt) {
  const publishedDate = parseTimestamp(publishedAt);
  if (!publishedDate) return undefined;

  const diffMs = Math.max(Date.now() - publishedDate.getTime(), 0);
  const totalMinutes = Math.floor(diffMs / 60000);
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60
  };
}

function compareArticles(a, b, columns) {
  if (hasColumn(columns, "priority")) {
    const priorityA = Number.isFinite(Number(a.priority)) ? Number(a.priority) : -Infinity;
    const priorityB = Number.isFinite(Number(b.priority)) ? Number(b.priority) : -Infinity;
    if (priorityA !== priorityB) {
      return priorityB - priorityA;
    }
  }

  if (hasColumn(columns, "published_at")) {
    const publishedA = parseTimestamp(a.published_at)?.getTime() ?? -Infinity;
    const publishedB = parseTimestamp(b.published_at)?.getTime() ?? -Infinity;
    if (publishedA !== publishedB) {
      return publishedB - publishedA;
    }
  }

  if (hasColumn(columns, "id")) {
    const idA = Number.isFinite(Number(a.id)) ? Number(a.id) : -Infinity;
    const idB = Number.isFinite(Number(b.id)) ? Number(b.id) : -Infinity;
    if (idA !== idB) {
      return idB - idA;
    }
  }

  return 0;
}

function isPublishedArticle(article, columns) {
  if (hasColumn(columns, "status")) {
    const status = String(article.status ?? "").trim().toLowerCase();
    if (status && status !== "published") {
      return false;
    }
  }

  if (hasColumn(columns, "approved") && isFalsy(article.approved)) {
    return false;
  }

  return true;
}

function normalizeArticle(article, columns) {
  const cleanSlug = cleanArticleSlug(article.slug);
  const liveUpdates = parseLiveUpdates(article);
  let heroCrop = article.hero_crop;
  if (typeof heroCrop === "string") {
    try {
      heroCrop = JSON.parse(heroCrop);
    } catch {
      heroCrop = null;
    }
  }
  return {
    ...article,
    slug: cleanSlug || article.slug,
    raw_slug: article.slug,
    author_name: article.author_name || "The Veritas Desk",
    subcategory: article.subcategory || "",
    subcategory_slug: article.subcategory_slug || "",
    hero_crop: heroCrop,
    is_live: Boolean(article.is_live),
    live_updates: liveUpdates,
    live_updated_at: liveUpdates[0]?.created_at || article.updated_at || article.published_at || null,
    content_blocks: parseContentBlocks(article),
    published_ago: hasColumn(columns, "published_at")
      ? computePublishedAgo(article.published_at)
      : article.published_ago
  };
}

function normalizePublishedArticles(rows, columns) {
  return rows
    .filter((article) => isPublishedArticle(article, columns))
    .sort((a, b) => compareArticles(a, b, columns))
    .map((article) => normalizeArticle(article, columns));
}

function logArticleError(label, err, columns) {
  console.error(`${label}:`, {
    message: err?.message,
    code: err?.code,
    detail: err?.detail,
    hint: err?.hint,
    columns: columns ? Array.from(columns) : undefined
  });

  if (err?.stack) {
    console.error(err.stack);
  }
}

function parseContentBlocks(article) {
  if (Array.isArray(article.content_blocks)) {
    return article.content_blocks;
  }

  if (article.content_blocks) {
    try {
      return JSON.parse(article.content_blocks);
    } catch {
      return [];
    }
  }

  if (Array.isArray(article.paragraphs)) {
    return article.paragraphs.map((paragraph) => ({
      type: "paragraph",
      text: paragraph
    }));
  }

  if (typeof article.paragraphs === "string") {
    return article.paragraphs.split("\n").map((paragraph) => ({
      type: "paragraph",
      text: paragraph
    }));
  }

  return [];
}

function parseLiveUpdates(article) {
  if (Array.isArray(article.live_updates)) {
    return article.live_updates
      .filter(Boolean)
      .sort((a, b) => {
        const timeA = parseTimestamp(a?.created_at)?.getTime() ?? 0;
        const timeB = parseTimestamp(b?.created_at)?.getTime() ?? 0;
        return timeB - timeA;
      });
  }

  if (typeof article.live_updates === "string" && article.live_updates.trim()) {
    try {
      const parsed = JSON.parse(article.live_updates);
      return parseLiveUpdates({ live_updates: parsed });
    } catch {
      return [];
    }
  }

  return [];
}

router.get("/", async (req, res) => {
  try {
    const columns = await getArticleColumns();
    const result = await pool.query("SELECT * FROM articles");
    res.json(normalizePublishedArticles(result.rows, columns));
  } catch (err) {
    let columns;
    try {
      columns = await getArticleColumns();
    } catch {
      columns = undefined;
    }
    logArticleError("ARTICLES FETCH ERROR", err, columns);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/breaking", async (req, res) => {
  try {
    const columns = await getArticleColumns();
    if (!hasColumn(columns, "is_breaking")) {
      return res.json([]);
    }

    const result = await pool.query("SELECT * FROM articles");
    const rows = normalizePublishedArticles(result.rows, columns).filter((article) =>
      isTruthy(article.is_breaking)
    );
    res.json(rows);
  } catch (err) {
    let columns;
    try {
      columns = await getArticleColumns();
    } catch {
      columns = undefined;
    }
    logArticleError("BREAKING FETCH ERROR", err, columns);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/admin", requireAuth, async (req, res) => {
  try {
    const columns = await getArticleColumns();
    const selectColumns = [
      "id",
      "title",
      hasColumn(columns, "slug") ? "slug" : null,
      hasColumn(columns, "status") ? "status" : null,
      hasColumn(columns, "approved") ? "approved" : null,
      hasColumn(columns, "is_live") ? "is_live" : null,
      hasColumn(columns, "is_editorial") ? "is_editorial" : null,
      hasColumn(columns, "published_at") ? "published_at" : null,
      hasColumn(columns, "priority") ? "priority" : null
    ].filter(Boolean);

    const result = await pool.query(`SELECT ${selectColumns.join(", ")} FROM articles`);
    res.json(result.rows.sort((a, b) => compareArticles(a, b, columns)).map((article) => normalizeArticle(article, columns)));
  } catch (err) {
    let columns;
    try {
      columns = await getArticleColumns();
    } catch {
      columns = undefined;
    }
    logArticleError("ADMIN ARTICLES FETCH ERROR", err, columns);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/admin/:id", requireAuth, async (req, res) => {
  try {
    const columns = await getArticleColumns();
    const result = await pool.query(
      `
      SELECT *
      FROM articles
      WHERE id = $1
      LIMIT 1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Article not found" });
    }

    const article = result.rows[0];
    res.json(normalizeArticle(article, columns));
  } catch (err) {
    let columns;
    try {
      columns = await getArticleColumns();
    } catch {
      columns = undefined;
    }
    logArticleError("ADMIN ARTICLE FETCH ERROR", err, columns);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const requestedSlug = cleanArticleSlug(req.params.slug);
    const columns = await getArticleColumns();
    if (!hasColumn(columns, "slug")) {
      return res.status(404).json({ error: "Article not found" });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM articles
      WHERE slug = $1 OR slug LIKE $2
      `,
      [requestedSlug, `${requestedSlug}-%`]
    );

    const article = result.rows.find((row) => cleanArticleSlug(row.slug) === requestedSlug);

    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }
    if (!isPublishedArticle(article, columns)) {
      return res.status(404).json({ error: "Article not found" });
    }

    res.json(normalizeArticle(article, columns));
  } catch (err) {
    let columns;
    try {
      columns = await getArticleColumns();
    } catch {
      columns = undefined;
    }
    logArticleError("ARTICLE FETCH ERROR", err, columns);
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const {
      title,
      subheadline,
      slug,
      category,
      hero_image,
      hero_caption,
      hero_focus,
      hero_crop,
      author_name,
      subcategory,
      subcategory_slug,
      hashtags,
      paragraphs,
      bibliography,
      is_breaking,
      show_on_slider,
      show_on_category_slider,
      is_editorial,
      is_live,
      live_updates,
      content_blocks
    } = req.body;

    const safeParagraphs = (paragraphs || []).filter((paragraph) => paragraph.trim() !== "");
    const blocks =
      content_blocks && content_blocks.length
        ? content_blocks
        : safeParagraphs.map((paragraph) => ({ type: "paragraph", text: paragraph }));

    const content = blocks.map((block) => block.text).join("\n\n");
    const contentBlocksJSON = JSON.stringify(blocks);

    let columns = await ensureArticleColumn("author_name", "TEXT");
    columns = await ensureArticleColumn("subcategory", "TEXT");
    columns = await ensureArticleColumn("subcategory_slug", "TEXT");
    columns = await ensureArticleColumn("hero_focus", "TEXT DEFAULT 'auto'");
    columns = await ensureArticleColumn("hero_crop", "TEXT");
    columns = await ensureArticleColumn("show_on_category_slider", "BOOLEAN DEFAULT FALSE");
    columns = await ensureArticleColumn("is_editorial", "BOOLEAN DEFAULT FALSE");
    columns = await ensureArticleColumn("is_live", "BOOLEAN DEFAULT FALSE");
    columns = await ensureArticleColumn("live_updates", "TEXT");
    const insertColumns = [
      "title",
      "subheadline",
      "slug",
      "category",
      "hero_image",
      "hero_caption",
      "hero_focus",
      "hero_crop",
      "hashtags",
      "paragraphs",
      "bibliography",
      "is_breaking",
      "content",
      "content_blocks",
      "show_on_slider",
      "show_on_category_slider",
      "is_editorial",
      "is_live",
      "live_updates",
      "approved",
      "status",
      "published_at"
    ];
    const values = [
      title,
      subheadline,
      slug,
      category,
      hero_image,
      hero_caption,
      hero_focus || "auto",
      hero_crop ? JSON.stringify(hero_crop) : null,
      hashtags || [],
      safeParagraphs,
      bibliography,
      is_breaking || false,
      content,
      contentBlocksJSON,
      show_on_slider || false,
      show_on_category_slider || false,
      is_editorial || false,
      is_live || false,
      JSON.stringify(Array.isArray(live_updates) ? live_updates : []),
      true,
      "published",
      new Date()
    ];

    if (hasColumn(columns, "author_name")) {
      insertColumns.splice(6, 0, "author_name", "subcategory", "subcategory_slug");
      values.splice(6, 0, author_name?.trim() || "", subcategory?.trim() || "", subcategory_slug?.trim() || "");
    }

    const placeholders = insertColumns.map((_, index) => `$${index + 1}`).join(",");
    const result = await pool.query(
      `INSERT INTO articles (${insertColumns.join(", ")}) VALUES (${placeholders}) RETURNING *`,
      values
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("POST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM articles WHERE id = $1 RETURNING id", [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Article not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      subheadline,
      category,
      hero_image,
      hero_caption,
      hero_focus,
      hero_crop,
      author_name,
      subcategory,
      subcategory_slug,
      hashtags,
      paragraphs,
      bibliography,
      is_breaking,
      show_on_slider,
      show_on_category_slider,
      is_editorial,
      is_live,
      live_updates,
      content_blocks
    } = req.body;

    const safeParagraphs = (paragraphs || []).filter((paragraph) => paragraph.trim() !== "");
    const blocks =
      content_blocks && content_blocks.length
        ? content_blocks
        : safeParagraphs.map((paragraph) => ({ type: "paragraph", text: paragraph }));

    const content = blocks.map((block) => block.text).join("\n\n");
    const contentBlocksJSON = JSON.stringify(blocks);

    let columns = await ensureArticleColumn("author_name", "TEXT");
    columns = await ensureArticleColumn("subcategory", "TEXT");
    columns = await ensureArticleColumn("subcategory_slug", "TEXT");
    columns = await ensureArticleColumn("hero_focus", "TEXT DEFAULT 'auto'");
    columns = await ensureArticleColumn("hero_crop", "TEXT");
    columns = await ensureArticleColumn("show_on_category_slider", "BOOLEAN DEFAULT FALSE");
    columns = await ensureArticleColumn("is_editorial", "BOOLEAN DEFAULT FALSE");
    columns = await ensureArticleColumn("is_live", "BOOLEAN DEFAULT FALSE");
    columns = await ensureArticleColumn("live_updates", "TEXT");
    const updateEntries = [
      ["title", title],
      ["subheadline", subheadline],
      ["category", category],
      ["hero_image", hero_image],
      ["hero_caption", hero_caption],
      ["hero_focus", hero_focus || "auto"],
      ["hero_crop", hero_crop ? JSON.stringify(hero_crop) : null],
      ["hashtags", hashtags || []],
      ["paragraphs", safeParagraphs],
      ["bibliography", bibliography],
      ["is_breaking", is_breaking || false],
      ["content", content],
      ["content_blocks", contentBlocksJSON],
      ["show_on_slider", show_on_slider ?? false],
      ["show_on_category_slider", show_on_category_slider ?? false],
      ["is_editorial", is_editorial ?? false],
      ["is_live", is_live ?? false],
      ["live_updates", JSON.stringify(Array.isArray(live_updates) ? live_updates : [])]
    ];

    if (hasColumn(columns, "author_name")) {
      updateEntries.splice(
        5,
        0,
        ["author_name", author_name?.trim() || ""],
        ["subcategory", subcategory?.trim() || ""],
        ["subcategory_slug", subcategory_slug?.trim() || ""]
      );
    }

    const values = updateEntries.map(([, value]) => value);
    const updates = updateEntries.map(([column], index) => `${column}=$${index + 1}`);
    const whereIndex = values.length + 1;
    values.push(id);

    const result = await pool.query(
      `UPDATE articles SET ${updates.join(", ")} WHERE id=$${whereIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Article not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ error: "Update failed" });
  }
});

export default router;
