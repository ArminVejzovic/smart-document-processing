export const validateDocument = async (doc, pool) => {
  const issues = [];

  if (!doc.documentType) issues.push("Missing document type");
  if (!doc.supplier) issues.push("Missing supplier");
  if (!doc.documentNumber) issues.push("Missing document number");
  if (!doc.issueDate) issues.push("Missing issue date");
  //if (!doc.currency) issues.push("Missing currency");

  if (doc.issueDate && isNaN(Date.parse(doc.issueDate))) {
    issues.push("Invalid issue date");
  }

  if (doc.dueDate && isNaN(Date.parse(doc.dueDate))) {
    issues.push("Invalid due date");
  }

  if (doc.issueDate && doc.dueDate) {
    const issue = new Date(doc.issueDate);
    const due = new Date(doc.dueDate);

    if (due < issue) {
      issues.push("Due date is before issue date");
    }
  }

  if (doc.subtotal !== null && doc.tax !== null && doc.total !== null) {
    const expectedTotal = Number((doc.subtotal + doc.tax).toFixed(2));

    if (Math.abs(expectedTotal - doc.total) > 0.01) {
      issues.push(`Total mismatch: expected ${expectedTotal}, got ${doc.total}`);
    }
  }

  for (const item of doc.lineItems || []) {
    if (
      item.quantity !== null &&
      item.unitPrice !== null &&
      item.total !== null
    ) {
      const expectedItemTotal = Number((item.quantity * item.unitPrice).toFixed(2));

      if (Math.abs(expectedItemTotal - item.total) > 0.01) {
        issues.push(
          `Line item mismatch for "${item.description}": expected ${expectedItemTotal}, got ${item.total}`
        );
      }
    }
  }

  if (doc.documentNumber) {
    const duplicateResult = await pool.query(
      `SELECT id FROM documents WHERE document_number = $1 LIMIT 1`,
      [doc.documentNumber]
    );

    if (duplicateResult.rows.length > 0) {
      issues.push("Duplicate document number");
    }
  }

  return issues;
};

export const getStatusFromIssues = (issues) => {
  if (issues.length > 0) {
    return "Needs Review";
  }

  return "Validated";
};