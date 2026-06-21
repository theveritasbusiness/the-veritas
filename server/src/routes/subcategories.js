import express from "express";
import pool from "../db.js";
import { requireAuth } from "../auth.js";

const router = express.Router();
let ensured = false;

async function ensureSubcategoriesTable() {
  if (ensured) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS subcategories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      description TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  ensured = true;
}

function slugify(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

router.get("/", async (_req, res) => {
  try {
    await ensureSubcategoriesTable();
    const result = await pool.query(
      `
      SELECT id, name, slug, category, description, created_at
      FROM subcategories
      ORDER BY category ASC, name ASC
      `
    );
    res.json(result.rows);
  } catch (error) {
    console.error("SUBCATEGORIES FETCH ERROR:", error?.message || error);
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    await ensureSubcategoriesTable();

    const { name, category, description = "" } = req.body || {};
    const safeName = String(name || "").trim();
    const safeCategory = String(category || "").trim();

    if (!safeName || !safeCategory) {
      return res.status(400).json({ error: "Subcategory name and category are required" });
    }

    const slug = slugify(safeName);

    if (!slug) {
      return res.status(400).json({ error: "Invalid subcategory name" });
    }

    const existing = await pool.query(
      `
      SELECT id
      FROM subcategories
      WHERE slug = $1
      LIMIT 1
      `,
      [slug]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Subcategory already exists" });
    }

    const result = await pool.query(
      `
      INSERT INTO subcategories (name, slug, category, description)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, slug, category, description, created_at
      `,
      [safeName, slug, safeCategory, String(description || "").trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("SUBCATEGORY CREATE ERROR:", error?.message || error);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
