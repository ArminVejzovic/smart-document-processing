import { pool } from "../config/db.js";

export const uploadDocument = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await pool.query(
      `INSERT INTO documents 
      (file_name, file_type, status)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [file.originalname, file.mimetype, "Uploaded"]
    );

    res.status(201).json({
      message: "Document uploaded successfully",
      document: result.rows[0],
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM documents ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get documents error:", error);
    res.status(500).json({ message: "Server error" });
  }
};