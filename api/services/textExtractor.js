import path from "path";
import csvParser from "csv-parser";
import { Readable } from "stream";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export const extractTextFromFile = async (file) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ext === ".pdf") {
    return await extractPdfText(file.buffer);
  }

  if (ext === ".txt") {
    return file.buffer.toString("utf-8");
  }

  if (ext === ".csv") {
    return await extractCsvText(file.buffer);
  }

  if ([".png", ".jpg", ".jpeg"].includes(ext)) {
    const result = await Tesseract.recognize(file.buffer, "eng");
    return result.data.text;
  }

  throw new Error("Unsupported file type");
};

const extractPdfText = async (buffer) => {
  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    disableFontFace: true,
  }).promise;

  let text = "";

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();

    const pageText = content.items
      .map((item) => item.str)
      .join(" ");

    text += pageText + "\n";
  }

  return text.trim();
};

const extractCsvText = (buffer) => {
  return new Promise((resolve, reject) => {
    const rows = [];

    Readable.from(buffer.toString("utf-8"))
      .pipe(csvParser())
      .on("data", (row) => {
        rows.push(Object.values(row).join(" "));
      })
      .on("end", () => {
        resolve(rows.join("\n"));
      })
      .on("error", reject);
  });
};