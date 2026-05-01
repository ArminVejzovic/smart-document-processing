## API Documentation

### Base URL

```
http://localhost:5001/api
```

---

## Documents

### Upload and process document

```
POST /documents/upload
```

Uploads a document, extracts text, parses structured data, validates it, and stores the result in the database.

**Supported file types:**

```
PDF, TXT, CSV, PNG, JPG, JPEG
```

**Request type:**

```
multipart/form-data
```

**Form field:**

```
document
```

**Example response:**

```json
{
  "message": "Document processed successfully",
  "document": {
    "id": "uuid",
    "file_name": "invoice_1.pdf",
    "document_type": "invoice",
    "supplier": "Company 0",
    "document_number": "INV-1000",
    "issue_date": "2026-04-28",
    "due_date": null,
    "currency": null,
    "subtotal": "645.00",
    "tax": "129.00",
    "total": "800.00",
    "status": "Needs Review",
    "issues": [
      "Missing currency",
      "Total mismatch: expected 774, got 800"
    ]
  },
  "lineItems": [
    {
      "description": "Service A",
      "quantity": 5,
      "unitPrice": 129,
      "total": 645
    }
  ],
  "issues": [
    "Missing currency",
    "Total mismatch: expected 774, got 800"
  ]
}
```

---

### Get all documents

```
GET /documents
```

Returns all processed documents ordered by creation date.

**Example response:**

```json
[
  {
    "id": "uuid",
    "file_name": "invoice_1.pdf",
    "document_type": "invoice",
    "supplier": "Company 0",
    "document_number": "INV-1000",
    "total": "800.00",
    "currency": null,
    "status": "Needs Review",
    "issues": [
      "Missing currency",
      "Total mismatch: expected 774, got 800"
    ]
  }
]
```

---

### Get single document

```
GET /documents/:id
```

Returns a single document with its line items.

**Example response:**

```json
{
  "document": {
    "id": "uuid",
    "file_name": "invoice_1.pdf",
    "document_type": "invoice",
    "supplier": "Company 0",
    "document_number": "INV-1000",
    "status": "Needs Review"
  },
  "lineItems": [
    {
      "id": "uuid",
      "description": "Service A",
      "quantity": "5.00",
      "unit_price": "129.00",
      "total": "645.00"
    }
  ]
}
```

---

### Update reviewed document

```
PUT /documents/:id
```

Updates corrected extracted data and saves the final review status.

**Example request body:**

```json
{
  "document_type": "invoice",
  "supplier": "Company 0",
  "document_number": "INV-1000",
  "issue_date": "2026-04-28",
  "due_date": null,
  "currency": "EUR",
  "subtotal": 645,
  "tax": 129,
  "total": 774,
  "status": "Validated",
  "issues": []
}
```

**Example response:**

```json
{
  "message": "Document updated successfully",
  "document": {
    "id": "uuid",
    "document_number": "INV-1000",
    "status": "Validated",
    "issues": []
  }
}
```

---

### Get totals grouped by currency

```
GET /documents/totals/currency
```

Returns aggregated totals grouped by currency.

**Example response:**

```json
[
  {
    "currency": "BAM",
    "total_sum": "1123.00"
  },
  {
    "currency": "EUR",
    "total_sum": "758.00"
  }
]
```

---

## Validation Rules

The backend validates:

* Missing required fields
* Invalid issue or due dates
* Due date before issue date
* Incorrect subtotal + tax = total calculations
* Incorrect line item quantity × unit price calculations
* Duplicate document numbers
