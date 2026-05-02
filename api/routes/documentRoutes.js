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

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.post("/upload", upload.single("document"), uploadDocument);
router.get("/", getDocuments);
router.get("/:id", getDocumentById);
router.put("/:id", updateDocument);
router.get("/totals/currency", getTotalsByCurrency);

export default router;