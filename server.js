import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import csvRoutes from "./routes/csvRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/csv", csvRoutes);

const PORT = process.env.PORT || 5345;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
