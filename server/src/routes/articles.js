import express from "express";
import pool from "../db.js";
import { requireAuth } from "../auth.js";

const router = express.Router();

/**
 * GET all published articles (for frontend)
 */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *,
      NOW() - published_at AS published_ago
      FROM articles
      WHERE status = 'published' AND approved = true
      ORDER BY priority DESC, published_at DESC
      `
    );
    res.json(result.rows);
  } catch (err) {
    console.error("ARTICLES FETCH ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});

/**
 * GET breaking news
 */
router.get("/breaking", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM articles
      WHERE is_breaking = true
  AND status = 'published'
  AND approved = true
      ORDER BY published_at DESC
      `
    );
    res.json(result.rows);
  } catch (err) {
    console.error("BREAKING FETCH ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});

/**
 * GET single article by slug
 */
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      `
      SELECT *,
NOW() - published_at AS published_ago
      FROM articles
      WHERE slug = $1
        AND status = 'published'
      LIMIT 1
      `,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Article not found" });
    }

    const article = result.rows[0];

let blocks = [];

// ✅ try content_blocks first
if (article.content_blocks) {
  try {
    blocks = JSON.parse(article.content_blocks);
  } catch {
    blocks = [];
  }
}

// ✅ fallback to paragraphs if empty
if (!blocks.length && article.paragraphs) {
  blocks = article.paragraphs.map(p => ({
    type: "paragraph",
    text: p
  }));
}

res.json({
  ...article,
  content_blocks: blocks
});

} catch (err) {
  console.error("ARTICLE FETCH ERROR:", err);
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

    const safeParagraphs = (paragraphs || []).filter(p => p.trim() !== "");

    const blocks =
      content_blocks && content_blocks.length
        ? content_blocks
        : safeParagraphs.map(p => ({ type: "paragraph", text: p }));

    const content = blocks.map(b => b.text).join("\n\n");
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
    await pool.query("DELETE FROM articles WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
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

    const safeParagraphs = (paragraphs || []).filter(p => p.trim() !== "");

    const blocks =
      content_blocks && content_blocks.length
        ? content_blocks
        : safeParagraphs.map(p => ({ type: "paragraph", text: p }));

    const content = blocks.map(b => b.text).join("\n\n");
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

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

export default router;
