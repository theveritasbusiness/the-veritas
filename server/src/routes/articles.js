import express from "express";
import pool from "../db.js";

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
      SELECT *
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

    res.json(result.rows[0]);
  } catch (err) {
    console.error("ARTICLE FETCH ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
