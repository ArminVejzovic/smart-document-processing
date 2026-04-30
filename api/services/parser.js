const cleanNumber = (value) => {
  if (!value) return null;

  return Number(
    value
      .toString()
      .replace(",", ".")
      .replace(/[^\d.]/g, "")
  );
};

export const parseDocumentText = (text) => {
  const normalizedText = text.replace(/\r/g, "").trim();

  const documentType = /purchase\s*order/i.test(normalizedText)
    ? "purchase_order"
    : "invoice";

  const supplierMatch =
    normalizedText.match(/Supplier:\s*(.+)/i) ||
    normalizedText.match(/Supplier\s+(.+)/i);

  const numberMatch =
    normalizedText.match(/Number:\s*([A-Z0-9-]+)/i) ||
    normalizedText.match(/Invoice\s*([A-Z0-9-]+)/i) ||
    normalizedText.match(/Purchase\s*Order\s*([A-Z0-9-]+)/i);

  const issueDateMatch =
    normalizedText.match(/Date:\s*(\d{4}-\d{2}-\d{2})/i) ||
    normalizedText.match(/Issue Date:\s*(.+)/i);

  const dueDateMatch =
    normalizedText.match(/Due Date:\s*(.+)/i);

  const currencyMatch =
    normalizedText.match(/\b(EUR|USD|BAM|AED|GBP)\b/i);

  const subtotalMatch =
    normalizedText.match(/Subtotal\s*[:\-]?\s*([\d.,]+)/i) ||
    normalizedText.match(/Sub Total\s*[:\-]?\s*([\d.,]+)/i);

    const taxMatch =
    normalizedText.match(/Tax\s*\(\d+%\)\s*[:\-]?\s*([\d.,]+)/i) ||
    normalizedText.match(/Tax\s*[:\-]?\s*([\d.,]+)/i) ||
    normalizedText.match(/VAT\s*[:\-]?\s*([\d.,]+)/i);

    const totalMatches = [
    ...normalizedText.matchAll(/Total\s*[:\-]?\s*(?:[A-Z]{3}\s*)?([\d.,]+)/gi),
   ];
  const lastTotalMatch = totalMatches.length > 0
    ? totalMatches[totalMatches.length - 1]
    : null;

  const lineItems = extractLineItems(normalizedText);

  return {
    documentType,
    supplier: supplierMatch ? supplierMatch[1].trim() : null,
    documentNumber: numberMatch ? numberMatch[1].trim() : null,
    issueDate: issueDateMatch ? issueDateMatch[1].trim() : null,
    dueDate: dueDateMatch ? dueDateMatch[1].trim() : null,
    currency: currencyMatch ? currencyMatch[1].toUpperCase() : null,
    subtotal: subtotalMatch ? cleanNumber(subtotalMatch[1]) : null,
    tax: taxMatch ? cleanNumber(taxMatch[1]) : null,
    total: lastTotalMatch ? cleanNumber(lastTotalMatch[1]) : null,
    lineItems,
    rawText: normalizedText,
  };
};

const extractLineItems = (text) => {
  const lines = text.split("\n");
  const items = [];

  for (const line of lines) {
    const match = line.match(/^(.+?)\s+(\d+)\s+([\d.,]+)\s+([\d.,]+)$/);

    if (match) {
      items.push({
        description: match[1].trim(),
        quantity: cleanNumber(match[2]),
        unitPrice: cleanNumber(match[3]),
        total: cleanNumber(match[4]),
      });
    }
  }

  return items;
};