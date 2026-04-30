import { pool } from "../db.js";
import { extractTextFromFile } from "../services/textExtractor.js";
import { parseDocumentText } from "../services/parser.js";
import { validateDocument, getStatusFromIssues } from "../services/validator.js";

export const uploadDocument = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const rawText = await extractTextFromFile(file);
    const parsedDoc = parseDocumentText(rawText);
    const issues = await validateDocument(parsedDoc, pool);
    const status = getStatusFromIssues(issues);

    const documentResult = await pool.query(
      `INSERT INTO documents
      (
        file_name,
        file_type,
        document_type,
        supplier,
        document_number,
        issue_date,
        due_date,
        currency,
        subtotal,
        tax,
        total,
        status,
        issues,
        raw_text
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING *`,
      [
        file.originalname,
        file.mimetype,
        parsedDoc.documentType,
        parsedDoc.supplier,
        parsedDoc.documentNumber,
        parsedDoc.issueDate,
        parsedDoc.dueDate,
        parsedDoc.currency,
        parsedDoc.subtotal,
        parsedDoc.tax,
        parsedDoc.total,
        status,
        JSON.stringify(issues),
        parsedDoc.rawText,
      ]
    );

    const savedDocument = documentResult.rows[0];

    for (const item of parsedDoc.lineItems || []) {
      await pool.query(
        `INSERT INTO line_items
        (document_id, description, quantity, unit_price, total)
        VALUES ($1, $2, $3, $4, $5)`,
        [
          savedDocument.id,
          item.description,
          item.quantity,
          item.unitPrice,
          item.total,
        ]
      );
    }

    res.status(201).json({
      message: "Document processed successfully",
      document: savedDocument,
      lineItems: parsedDoc.lineItems,
      issues,
    });
  } catch (error) {
    console.error("Upload/process error:", error);
    res.status(500).json({
      message: "Server error while processing document",
      error: error.message,
    });
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