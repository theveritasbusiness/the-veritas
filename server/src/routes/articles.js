import express from "express";
import pool from "../db.js";
import { requireAuth } from "../auth.js";

const router = express.Router();

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
    const result = await pool.query(
      `
      SELECT *,
      NOW() - published_at AS published_ago
      FROM articles
      WHERE status = 'published' AND COALESCE(approved, true) = true
      ORDER BY priority DESC, published_at DESC
      `
    );
    res.json(result.rows);
  } catch (err) {
    console.error("ARTICLES FETCH ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/breaking", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM articles
      WHERE is_breaking = true
        AND status = 'published'
        AND COALESCE(approved, true) = true
      ORDER BY published_at DESC
      `
    );
    res.json(result.rows);
  } catch (err) {
    console.error("BREAKING FETCH ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/admin", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *,
      NOW() - published_at AS published_ago
      FROM articles
      ORDER BY published_at DESC NULLS LAST, id DESC
      `
    );

    res.json(
      result.rows.map((article) => ({
        ...article,
        content_blocks: parseContentBlocks(article)
      }))
    );
  } catch (err) {
    console.error("ADMIN ARTICLES FETCH ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/admin/:id", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *,
      NOW() - published_at AS published_ago
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
    res.json({
      ...article,
      content_blocks: parseContentBlocks(article)
    });
  } catch (err) {
    console.error("ADMIN ARTICLE FETCH ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});

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
        AND COALESCE(approved, true) = true
      LIMIT 1
      `,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Article not found" });
    }

    const article = result.rows[0];

    res.json({
      ...article,
      content_blocks: parseContentBlocks(article)
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
