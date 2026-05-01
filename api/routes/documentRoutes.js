import express from "express";
import multer from "multer";
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  getTotalsByCurrency
} from "../controllers/documentController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "src/uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

router.post("/upload", upload.single("document"), uploadDocument);
router.get("/", getDocuments);
router.get("/:id", getDocumentById);
router.put("/:id", updateDocument);
router.get("/totals/currency", getTotalsByCurrency);

export default router;