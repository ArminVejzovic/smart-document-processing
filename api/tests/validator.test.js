import { describe, it, expect } from "vitest";
import { validateDocument, getStatusFromIssues } from "../services/validator.js";

const fakePoolWithoutDuplicates = {
  query: async () => ({ rows: [] }),
};

const fakePoolWithDuplicate = {
  query: async () => ({ rows: [{ id: "existing-id" }] }),
};

describe("validateDocument", () => {
  it("should detect incorrect totals", async () => {
    const doc = {
      documentType: "invoice",
      supplier: "Company 0",
      documentNumber: "INV-1000",
      issueDate: "2026-04-28",
      dueDate: null,
      currency: "EUR",
      subtotal: 645,
      tax: 129,
      total: 800,
      lineItems: [],
    };

    const issues = await validateDocument(doc, fakePoolWithoutDuplicates);

    expect(issues).toContain("Total mismatch: expected 774, got 800");
  });

  it("should detect missing required fields", async () => {
    const doc = {
      documentType: "invoice",
      supplier: null,
      documentNumber: null,
      issueDate: null,
      dueDate: null,
      currency: null,
      subtotal: null,
      tax: null,
      total: 758,
      lineItems: [],
    };

    const issues = await validateDocument(doc, fakePoolWithoutDuplicates);

    expect(issues).toContain("Missing supplier");
    expect(issues).toContain("Missing document number");
    expect(issues).toContain("Missing issue date");
    expect(issues).toContain("Missing currency");
  });

  it("should validate line item calculations", async () => {
    const doc = {
      documentType: "invoice",
      supplier: "Company",
      documentNumber: "INV-1",
      issueDate: "2026-04-28",
      dueDate: null,
      currency: "EUR",
      subtotal: 100,
      tax: 20,
      total: 120,
      lineItems: [
        {
          description: "Service A",
          quantity: 2,
          unitPrice: 50,
          total: 130,
        },
      ],
    };

    const issues = await validateDocument(doc, fakePoolWithoutDuplicates);

    expect(issues).toContain(
      'Line item mismatch for "Service A": expected 100, got 130'
    );
  });

  it("should detect duplicate document numbers", async () => {
    const doc = {
      documentType: "invoice",
      supplier: "Company",
      documentNumber: "INV-1000",
      issueDate: "2026-04-28",
      dueDate: null,
      currency: "EUR",
      subtotal: 100,
      tax: 20,
      total: 120,
      lineItems: [],
    };

    const issues = await validateDocument(doc, fakePoolWithDuplicate);

    expect(issues).toContain("Duplicate document number");
  });

  it("should return Validated status when there are no issues", () => {
    expect(getStatusFromIssues([])).toBe("Validated");
  });

  it("should return Needs Review status when there are issues", () => {
    expect(getStatusFromIssues(["Missing supplier"])).toBe("Needs Review");
  });
});