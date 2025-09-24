import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import csvParser from "csv-parser";
import { insertCSVData, listCSVData,  init } from "../model/csvModel.js";

const router = express.Router();

// Multer setup (still saves temporarily so we can stream it)
const uploadsDir = path.resolve("uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) =>
    cb(null, `csv_${Date.now()}_${file.originalname}`),
});
const upload = multer({ storage });

// 📌 Upload CSV → Save to Oracle DB
router.post("/upload", upload.single("csv"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    console.log("📂 Uploaded file:", req.file);

    await init(); // ensure DB + table exists

    const results = [];

    // Parse CSV
    fs.createReadStream(req.file.path)
      .pipe(csvParser())
      .on("data", (row) => {
        // Map row → table columns (keep column names in your CSV same as DB)
        results.push({
          NAME: row.Name,
          EMPLOYEENUMBER: row.EmployNumber,
          AGE: parseInt(row.Age, 10),
          DATEOFBIRTH: row.DateOfBirth,
        });
      })
      .on("end", async () => {
        try {
          // Insert into Oracle
          await insertCSVData(results);

          // Delete file after processing (optional)
          fs.unlinkSync(req.file.path);

          res.json({
            message: "✅ CSV data saved to Oracle DB",
            inserted: results.length,
          });
        } catch (err) {
          console.error("❌ DB Insert Error:", err);
          res.status(500).json({ error: "Database insert failed" });
        }
      });
  } catch (err) {
    console.error("❌ Upload Error:", err);
    res.status(500).json({ error: err.message });
  }
});

//Get all data from the Oracle DB
router.get("/data", async (req, res) => {
  try {
    await init(); // ensure DB + table exists

    const data = await listCSVData();
    res.json(data);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;