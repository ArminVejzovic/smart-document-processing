import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import documentRoutes from "./routes/documentRoutes.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Smart Document Processing API is running" });
});

app.use("/api/documents", documentRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});