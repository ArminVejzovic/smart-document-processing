import { describe, it, expect } from "vitest";
import { parseDocumentText } from "../services/parser.js";

describe("parseDocumentText", () => {
  it("should extract invoice fields from text", () => {
    const text = `
        Invoice
        Supplier: Company 0
        Number: INV-1000
        Date: 2026-04-28
        Description Qty Unit Price Total
        Service A 5 129 645
        Subtotal 645
        Tax (20%) 129.0
        Total 800.0
    `;

    const result = parseDocumentText(text);

    expect(result.documentType).toBe("invoice");
    expect(result.supplier).toBe("Company 0");
    expect(result.documentNumber).toBe("INV-1000");
    expect(result.issueDate).toBe("2026-04-28");
    expect(result.subtotal).toBe(645);
    expect(result.tax).toBe(129);
    expect(result.total).toBe(800);
    expect(result.lineItems.length).toBeGreaterThan(0);
  });

  it("should extract purchase order type", () => {
    const text = `
        Purchase Order
        Supplier: Buyer 1
        Number: PO-2001
        Date: 2026-04-28
        Subtotal 165
        Tax (0%) 0
        Total 165
    `;

    const result = parseDocumentText(text);

    expect(result.documentType).toBe("purchase_order");
    expect(result.documentNumber).toBe("PO-2001");
    expect(result.total).toBe(165);
  });
});