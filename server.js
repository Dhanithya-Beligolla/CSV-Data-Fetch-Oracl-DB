import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";
import path from "path";
import videoRoutes from "./routes/videoRoutes.js";
import { init as initVideoTable } from "./model/videoModel.js";
import { initialize as initOracle } from "./db/config.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));

// Ensure uploads directory exists
const uploadsDir = path.resolve("uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Bootstrap server
async function bootstrap() {
  // Initialize database (ensure tables exist)
  await initOracle();
  await initVideoTable();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Routes
app.get("/", (req, res) => {
  res.send("Node Backend with Video Upload (Oracle DB)");
});

app.use("/api/videos", videoRoutes);

// Start Server
bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
