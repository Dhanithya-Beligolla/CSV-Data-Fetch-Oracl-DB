import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import csvParser from "csv-parser";
import { insertCSVData, listCSVData, init, COLUMNS, updateByComplainRef } from "../model/csvModel.js";

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
    const normalizedColumnSet = new Set(COLUMNS.map(c => c.toLowerCase()));

    function normalizeHeader(h) {
      return h
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')  // spaces to underscore
        .replace(/\./g, '_');   // dots to underscore
    }

    fs.createReadStream(req.file.path)
      .pipe(csvParser())
      .on("headers", (headers) => {
        console.log("📑 CSV Headers:", headers);
      })
      .on("data", (row) => {
        const mapped = {};
        let hasValue = false;
        for (const rawKey in row) {
          const norm = normalizeHeader(rawKey);
            if (normalizedColumnSet.has(norm)) {
              const colName = COLUMNS.find(c => c.toLowerCase() === norm);
              let v = row[rawKey];
              if (v === '') v = null;
              if (v !== null && v !== undefined) hasValue = true;
              mapped[colName] = v;
            }
        }
        // Ensure all columns exist, fill null for missing
        COLUMNS.forEach(c => { if (!(c in mapped)) mapped[c] = null; });
        if (hasValue) results.push(mapped);
      })
      .on("end", async () => {
        try {
          await insertCSVData(results);
          fs.unlinkSync(req.file.path);
          res.json({ message: "✅ CSV data saved to Oracle DB", inserted: results.length });
        } catch (err) {
          console.error("❌ DB Insert Error:", err);
          res.status(500).json({ error: "Database insert failed" });
        }
      })
      .on("error", (err) => {
        console.error("❌ CSV Parse Error:", err);
        res.status(500).json({ error: "CSV parse failed" });
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

// Update via encoded path param (client must URL-encode slashes & spaces)
router.put('/data/:refNo', async (req, res) => {
  try {
    await init();
  const refNo = decodeURIComponent(req.params.refNo);
    const payload = req.body || {};
    if (!refNo) return res.status(400).json({ error: 'refNo param required' });
    const result = await updateByComplainRef(refNo, payload);
    if (result.rowsAffected === 0) return res.status(404).json({ message: 'Not found or nothing updated' });
    res.json({ message: 'Updated', refNo, rowsAffected: result.rowsAffected });
  } catch (err) {
    console.error('❌ Update Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update via body { refNo, ...fields }
router.put('/data', async (req, res) => {
  try {
    await init();
    const { refNo, ...fields } = req.body || {};
    if (!refNo) return res.status(400).json({ error: 'refNo required in body' });
    const result = await updateByComplainRef(refNo, fields);
    if (result.rowsAffected === 0) return res.status(404).json({ message: 'Not found or nothing updated' });
    res.json({ message: 'Updated', refNo, rowsAffected: result.rowsAffected });
  } catch (err) {
    console.error('❌ Update Error (body):', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;