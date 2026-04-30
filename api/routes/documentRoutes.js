import express from "express";
import multer from "multer";
import {
  uploadDocument,
  getDocuments,
} from "../controllers/documentController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post("/upload", upload.single("document"), uploadDocument);
router.get("/", getDocuments);

export default router;