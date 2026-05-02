# smart-document-processing
Smart Document Processing

Frontend: React + Vite

Backend: Node.js + Express

Database: PostgreSQL


# Smart Document Processing System

## Overview

This project is a full-stack application for processing real-world business documents such as invoices and purchase orders. It extracts structured data, validates it, and allows users to review and correct the extracted information.

The system supports multiple file formats including:

* PDF documents
* Images (OCR)
* CSV files
* TXT files

---

## Setup Instructions

### Prerequisites

* Node.js
* npm
* Supabase account
* Git

---

## Project Structure

```
smart-document-processing/
├── api/      # Backend (Node.js + Express)
├── app/      # Frontend (React + Vite)
└── API_DOCUMENTATION.md
└── LICENSE
└── README.md
└── docker-compose.yml
```

---

## Database Setup

Run this SQL in Supabase:

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  stored_file_name TEXT,
  file_type TEXT,
  document_type TEXT,
  supplier TEXT,
  document_number TEXT,
  issue_date TEXT,
  due_date TEXT,
  currency TEXT,
  subtotal NUMERIC(12,2),
  tax NUMERIC(12,2),
  total NUMERIC(12,2),
  status TEXT DEFAULT 'Uploaded',
  issues JSONB DEFAULT '[]',
  raw_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  description TEXT,
  quantity NUMERIC(12,2),
  unit_price NUMERIC(12,2),
  total NUMERIC(12,2)
);
```

---

## Backend Setup

```bash
cd api
npm install
```

Create `.env`:

```
PORT=5001
DATABASE_URL=your_database_url
FRONTEND_URL=http://localhost:5173
```

Run backend:

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd app
npm install
```

Create `.env`:

```
VITE_API_URL=http://localhost:5001/api/documents
```

Run frontend:

```bash
npm run dev
```

---

## Running Tests

```bash
cd api
npm test
```

Tests include:

* Parser tests
* Validation logic tests

---

## Docker Setup

```bash
docker compose up --build
```

Frontend:

```
http://localhost:5173
```

Backend:

```
http://localhost:5001
```

---

## Approach

The system processes uploaded documents in multiple stages:

1. File upload
2. Text extraction (PDF, OCR, CSV, TXT)
3. Parsing structured data
4. Validation of extracted data
5. Storing results in database
6. Manual review and correction

Because documents are often inconsistent, the system uses:

* Flexible parsing (regex + fallback)
* Validation rules
* Manual review interface

Instead of forcing perfect extraction, the system prioritizes:

```
Extract what you can → Detect issues → Allow user correction
```

---

## Validation Logic

The backend validates:

* Missing required fields
* Invalid dates
* Due date before issue date
* Subtotal + tax ≠ total
* Line item calculation mismatch
* Duplicate document numbers

Statuses:

```
Validated
Needs Review
Rejected
```

---

## Dashboard Features

* Upload documents
* View all processed documents
* Search functionality
* Status overview
* Issue highlighting
* Totals grouped by currency
* Review page
* Update documents
* Delete documents

---

## API Documentation

### Base URL

```
http://localhost:5001/api
```

### Upload

```
POST /documents/upload
```

### Get all documents

```
GET /documents
```

### Get document

```
GET /documents/:id
```

### Update document

```
PUT /documents/:id
```

### Totals by currency

```
GET /documents/totals/currency
```

### Delete document

```
DELETE /documents/:id
```

---

## AI Tools Used

AI tools were used for:

* Planning architecture
* Debugging
* Writing boilerplate code
* Improving documentation

---

## Improvements I Would Make

If I had more time:

* Better OCR preprocessing
* Layout-based parsing (tables, positions)
* Supplier-specific templates
* Confidence scoring
* Improved line item extraction
* Authentication system
* Cloud file storage (S3 / Supabase Storage)
* Swagger API docs
* More tests (integration tests)
* Production Docker setup
* Documents overview
* Create and store new documents when data is updated 

---

## Summary

This project demonstrates a complete document processing pipeline:

* Upload
* Extract
* Validate
* Review
* Update

The focus is on reliability through validation and user review, rather than perfect extraction.



