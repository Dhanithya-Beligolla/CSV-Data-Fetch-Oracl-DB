import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import csvParser from "csv-parser";
import { insertCSVData, listCSVData, init } from "../model/csvModel.js";

const router = express.Router();

// Multer upload setup
const uploadsDir = path.resolve("uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `csv_${Date.now()}_${file.originalname}`),
});
const upload = multer({ storage });

// 📌 Upload CSV
router.post("/upload", upload.single("csv"), async (req, res) => {
console.log("📂 Uploaded file:", req.file);  // 👈 check what Multer receives
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    await init();
    const results = [];

    fs.createReadStream(req.file.path)
      .pipe(csvParser())
      .on("data", (data) => {
        results.push({
          name: data.Name,
          employNumber: data.EmployNumber,
          age: parseInt(data.Age, 10),
          dateOfBirth: data.DateOfBirth,
        });
      })
      .on("end", async () => {
        await insertCSVData(results);
        res.json({ message: "✅ CSV uploaded & data saved to Oracle", inserted: results.length });
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 📌 Get all data
router.get("/all", async (req, res) => {
  try {
    const data = await listCSVData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
