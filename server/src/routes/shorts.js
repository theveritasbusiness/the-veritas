import express from "express";
import pool from "../db.js";
import { requireAuth } from "../auth.js";

const router = express.Router();
let ensured = false;

async function ensureShortsTable() {
  if (ensured) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS shorts (
      id SERIAL PRIMARY KEY,
      platform TEXT NOT NULL,
      href TEXT NOT NULL UNIQUE,
      embed TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  ensured = true;
}

function parseShortUrl(rawUrl = "") {
  const input = String(rawUrl || "").trim();

  if (!input) {
    throw new Error("Short link is required");
  }

  let url;

  try {
    url = new URL(input);
  } catch {
    throw new Error("Please enter a valid Instagram reel or YouTube short link");
  }

  const host = url.hostname.replace(/^www\./i, "").toLowerCase();
  const pathname = url.pathname || "";

  if (host === "instagram.com") {
    const match = pathname.match(/^\/(?:reel|p)\/([^/]+)\/?/i);

    if (!match?.[1]) {
      throw new Error("Instagram link is invalid");
    }

    const code = match[1];
    const routeType = pathname.toLowerCase().includes("/p/") ? "p" : "reel";
    const href = `https://www.instagram.com/${routeType}/${code}/`;

    return {
      platform: "instagram",
      href,
      embed: `${href}embed`
    };
  }

  if (host === "youtube.com") {
    const shortMatch = pathname.match(/^\/shorts\/([^/?#]+)/i);
    const watchId = url.searchParams.get("v");
    const videoId = shortMatch?.[1] || watchId;

    if (!videoId) {
      throw new Error("YouTube short link is invalid");
    }

    return {
      platform: "youtube",
      href: `https://www.youtube.com/shorts/${videoId}`,
      embed: `https://www.youtube.com/embed/${videoId}`
    };
  }

  if (host === "youtu.be") {
    const videoId = pathname.replace(/\//g, "").trim();

    if (!videoId) {
      throw new Error("YouTube short link is invalid");
    }

    return {
      platform: "youtube",
      href: `https://www.youtube.com/shorts/${videoId}`,
      embed: `https://www.youtube.com/embed/${videoId}`
    };
  }

  throw new Error("Only Instagram and YouTube short links are supported");
}

router.get("/", async (_req, res) => {
  try {
    await ensureShortsTable();

    const result = await pool.query(`
      SELECT id, platform, href, embed, created_at
      FROM shorts
      ORDER BY created_at DESC, id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("SHORTS FETCH ERROR:", error?.message || error);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/admin", requireAuth, async (_req, res) => {
  try {
    await ensureShortsTable();

    const result = await pool.query(`
      SELECT id, platform, href, embed, created_at
      FROM shorts
      ORDER BY created_at DESC, id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("ADMIN SHORTS FETCH ERROR:", error?.message || error);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/admin/:id", requireAuth, async (req, res) => {
  try {
    await ensureShortsTable();

    const result = await pool.query(
      `
      SELECT id, platform, href, embed, created_at
      FROM shorts
      WHERE id = $1
      LIMIT 1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Short not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("ADMIN SHORT FETCH ERROR:", error?.message || error);
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    await ensureShortsTable();

    const parsed = parseShortUrl(req.body?.url);

    const existing = await pool.query(
      `
      SELECT id, platform, href, embed, created_at
      FROM shorts
      WHERE href = $1
      LIMIT 1
      `,
      [parsed.href]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "This short is already added" });
    }

    const result = await pool.query(
      `
      INSERT INTO shorts (platform, href, embed)
      VALUES ($1, $2, $3)
      RETURNING id, platform, href, embed, created_at
      `,
      [parsed.platform, parsed.href, parsed.embed]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    const message = error?.message || "Database error";
    const status = /supported|valid|invalid|required/i.test(message) ? 400 : 500;
    console.error("SHORTS CREATE ERROR:", message);
    res.status(status).json({ error: message });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    await ensureShortsTable();

    const parsed = parseShortUrl(req.body?.url);

    const existing = await pool.query(
      `
      SELECT id
      FROM shorts
      WHERE href = $1 AND id <> $2
      LIMIT 1
      `,
      [parsed.href, req.params.id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "This short is already added" });
    }

    const result = await pool.query(
      `
      UPDATE shorts
      SET platform = $1, href = $2, embed = $3
      WHERE id = $4
      RETURNING id, platform, href, embed, created_at
      `,
      [parsed.platform, parsed.href, parsed.embed, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Short not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    const message = error?.message || "Database error";
    const status = /supported|valid|invalid|required/i.test(message) ? 400 : 500;
    console.error("SHORTS UPDATE ERROR:", message);
    res.status(status).json({ error: message });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await ensureShortsTable();

    const result = await pool.query(
      `
      DELETE FROM shorts
      WHERE id = $1
      RETURNING id
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Short not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("SHORTS DELETE ERROR:", error?.message || error);
    res.status(500).json({ error: "Delete failed" });
  }
});

export default router;
