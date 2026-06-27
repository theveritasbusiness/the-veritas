import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import articleRoutes from "./routes/articles.js";
import editorRoutes from "./routes/editors.js";
import electionRoutes from "./routes/electionRoutes.js";
import subcategoryRoutes from "./routes/subcategories.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://theveritas.netlify.app",
      "https://theveritas.in",
      "https://www.theveritas.in",
      "http://www.theveritas.in",
      "http://theveritas.in"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);

app.use(express.json());

app.use("/articles", articleRoutes);
app.use("/editors", editorRoutes);
app.use("/api/elections", electionRoutes);
app.use("/subcategories", subcategoryRoutes);

app.get("/", (req, res) => {
  res.send("Veritas backend running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
