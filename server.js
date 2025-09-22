import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import csvRoutes from "./routes/csvRoutes.js";
import { initialize } from "./db/config.js";
import { init as initCSVTable } from "./model/csvModel.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/csv", csvRoutes);

// Start server + initialize DB
const PORT = process.env.PORT || 5345;
app.listen(PORT, async () => {
  try {
    await initialize();           // test Oracle connection
    await initCSVTable();         // create CMS_CSV_DATA table if not exists
    console.log(`🚀 Server running on port ${PORT}`);
  } catch (err) {
    console.error("❌ Failed to initialize Oracle DB:", err.message);
  }
});