import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import articleRoutes from "./routes/articles.js";
import editorRoutes from "./routes/editors.js";

dotenv.config();
console.log("JWT_SECRET =", process.env.JWT_SECRET);
console.log("🔥 RUNNING THIS INDEX.JS FILE 🔥");
console.log("DATABASE_URL =", process.env.DATABASE_URL ? "EXISTS" : "MISSING");
const app = express();

app.use(cors({
  origin: ["https://theveritas.netlify.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

/* ROUTES */
app.use("/articles", articleRoutes);
app.use("/editors", editorRoutes);

app.get("/", (req, res) => {
  res.send("Veritas backend running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});