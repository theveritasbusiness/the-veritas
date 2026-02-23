import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { requireAuth } from "./auth.js";
import editorRoutes from "./routes/editors.js";
import pool from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

console.log("JWT_SECRET =", process.env.JWT_SECRET);
console.log("🔥 RUNNING THIS INDEX.JS FILE 🔥");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://theveritas.netlify.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);

  const intervals = [
    { label: "y", seconds: 31536000 },
    { label: "mo", seconds: 2592000 },
    { label: "d", seconds: 86400 },
    { label: "h", seconds: 3600 },
    { label: "m", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) return `${count}${interval.label} ago`;
  }

  return "just now";
}

const PORT = process.env.PORT || 5000;

/* ---------- ROUTES ---------- */

app.use("/editors", editorRoutes);

app.get("/", (req, res) => {
  res.send("Veritas backend running");
});

/* BREAKING */
app.get("/articles/breaking", async (req, res) => {
  try {
    const result = await pool.query(
"SELECT * FROM articles WHERE is_breaking = true AND status = 'published' ORDER BY published_at DESC" );

    const articlesWithTime = result.rows.map(article => ({
      ...article,
      published_ago: timeAgo(article.published_at)
    }));

    res.json(articlesWithTime);
  } catch (err) {
    console.error("BREAKING ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});

/* ALL ARTICLES */
app.get("/articles", async (req, res) => {
  try {
    const result = await pool.query(`
  SELECT *
FROM articles
WHERE status = 'published'
ORDER BY priority DESC, published_at DESC
`);

    const articlesWithTime = result.rows.map(article => ({
      ...article,
      published_ago: timeAgo(article.published_at)
    }));

    res.json(articlesWithTime);
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});

/* SINGLE ARTICLE */
app.get("/articles/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      "SELECT * FROM articles WHERE slug = $1 AND status = 'published'",
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Article not found" });
    }

    const article = result.rows[0];

    let blocks = [];

    // ✅ Try reading new structured content
    if (article.content_blocks) {
      try {
        blocks = JSON.parse(article.content_blocks);
      } catch {
        blocks = [];
      }
    }

    // ✅ Fallback for old articles
    if (!blocks.length && article.paragraphs) {
      blocks = article.paragraphs.map(p => ({
        type: "paragraph",
        text: p
      }));
    }

    res.json({
      ...article,
      published_ago: timeAgo(article.published_at),
      content_blocks: blocks
    });

  } catch (err) {
    console.error("SLUG ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});
/* POST ARTICLE */
app.post("/articles", requireAuth, async (req, res) => {
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
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
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

    res.json({
      ...result.rows[0],
      content_blocks: blocks
    });

  } catch (err) {
    console.error("POST ARTICLE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
/* START SERVER */
app.listen(PORT, () => {
  console.log(`Veritas backend running on port ${PORT}`);
});
/* DELETE ARTICLE */
app.delete("/articles/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM articles WHERE id = $1", [id]);

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});
/* UPDATE ARTICLE */
app.put("/articles/:id", async (req, res) => {
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
        title = $1,
        subheadline = $2,
        category = $3,
        hero_image = $4,
        hero_caption = $5,
        hashtags = $6,
        paragraphs = $7,
        bibliography = $8,
        is_breaking = $9,
        content = $10,
content_blocks = $11,
show_on_slider = $12
WHERE id = $13
      RETURNING *`,
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

    res.json({
      ...result.rows[0],
      content_blocks: blocks
    });

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});