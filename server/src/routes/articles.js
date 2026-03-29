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

function isTruthy(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    return ["true", "t", "1", "yes", "y"].includes(value.trim().toLowerCase());
  }
  return false;
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
  return {
    ...article,
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
    const result = await pool.query("SELECT * FROM articles");
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
    const { slug } = req.params;
    const columns = await getArticleColumns();
    if (!hasColumn(columns, "slug")) {
      return res.status(404).json({ error: "Article not found" });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM articles
      WHERE slug = $1
      LIMIT 1
      `,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Article not found" });
    }

    const article = result.rows[0];
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
      hashtags,
      paragraphs,
      bibliography,
      is_breaking,
      show_on_slider,
      content_blocks
    } = req.body;

    const safeParagraphs = (paragraphs || []).filter((paragraph) => paragraph.trim() !== "");
    const blocks =
      content_blocks && content_blocks.length
        ? content_blocks
        : safeParagraphs.map((paragraph) => ({ type: "paragraph", text: paragraph }));

    const content = blocks.map((block) => block.text).join("\n\n");
    const contentBlocksJSON = JSON.stringify(blocks);

    const result = await pool.query(
      `INSERT INTO articles
      (title, subheadline, slug, category, hero_image, hero_caption, hashtags, paragraphs, bibliography, is_breaking, content, content_blocks, show_on_slider, approved, status, published_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING *`,
      [
        title,
        subheadline,
        slug,
        category,
        hero_image,
        hero_caption,
        hashtags || [],
        safeParagraphs,
        bibliography,
        is_breaking || false,
        content,
        contentBlocksJSON,
        show_on_slider || false,
        true,
        "published",
        new Date()
      ]
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
      hashtags,
      paragraphs,
      bibliography,
      is_breaking,
      show_on_slider,
      content_blocks
    } = req.body;

    const safeParagraphs = (paragraphs || []).filter((paragraph) => paragraph.trim() !== "");
    const blocks =
      content_blocks && content_blocks.length
        ? content_blocks
        : safeParagraphs.map((paragraph) => ({ type: "paragraph", text: paragraph }));

    const content = blocks.map((block) => block.text).join("\n\n");
    const contentBlocksJSON = JSON.stringify(blocks);

    const result = await pool.query(
      `UPDATE articles SET
        title=$1, subheadline=$2, category=$3,
        hero_image=$4, hero_caption=$5,
        hashtags=$6, paragraphs=$7, bibliography=$8,
        is_breaking=$9, content=$10,
        content_blocks=$11, show_on_slider=$12
       WHERE id=$13 RETURNING *`,
      [
        title,
        subheadline,
        category,
        hero_image,
        hero_caption,
        hashtags || [],
        safeParagraphs,
        bibliography,
        is_breaking || false,
        content,
        contentBlocksJSON,
        show_on_slider ?? false,
        id
      ]
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
