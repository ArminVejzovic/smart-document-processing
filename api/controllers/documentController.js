import { pool } from "../config/db.js";
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

export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    const documentResult = await pool.query(
      `SELECT * FROM documents WHERE id = $1`,
      [id]
    );

    if (documentResult.rows.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    const lineItemsResult = await pool.query(
      `SELECT * FROM line_items WHERE document_id = $1`,
      [id]
    );

    res.json({
      document: documentResult.rows[0],
      lineItems: lineItemsResult.rows,
    });
  } catch (error) {
    console.error("Get document by id error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const {
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
    } = req.body;

    const lineItemsResult = await pool.query(
      `SELECT * FROM line_items WHERE document_id = $1`,
      [id]
    );

    const lineItems = lineItemsResult.rows.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      total: item.total,
    }));

    const docForValidation = {
      documentType: document_type,
      supplier,
      documentNumber: document_number,
      issueDate: issue_date,
      dueDate: due_date,
      currency,
      subtotal: subtotal !== "" && subtotal !== null ? Number(subtotal) : null,
      tax: tax !== "" && tax !== null ? Number(tax) : null,
      total: total !== "" && total !== null ? Number(total) : null,
      lineItems,
    };

    const issues = await validateDocument(docForValidation, pool, id);

    let finalStatus;

    if (status === "Rejected") {
      finalStatus = "Rejected";
    } else {
      finalStatus = getStatusFromIssues(issues);
    }

    const result = await pool.query(
      `UPDATE documents
       SET document_type = $1,
           supplier = $2,
           document_number = $3,
           issue_date = $4,
           due_date = $5,
           currency = $6,
           subtotal = $7,
           tax = $8,
           total = $9,
           status = $10,
           issues = $11
       WHERE id = $12
       RETURNING *`,
      [
        document_type,
        supplier,
        document_number,
        issue_date,
        due_date,
        currency,
        subtotal,
        tax,
        total,
        finalStatus,
        JSON.stringify(issues),
        id,
      ]
    );

    res.json({
      message: "Document updated and revalidated successfully",
      document: result.rows[0],
      issues,
    });
  } catch (error) {
    console.error("Update document error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getTotalsByCurrency = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT currency, SUM(total) as total_sum
      FROM documents
      WHERE total IS NOT NULL
        AND currency IS NOT NULL
        AND currency != ''
      GROUP BY currency
      ORDER BY currency
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Totals error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM documents WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Server error" });
  }
};