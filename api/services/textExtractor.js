import fs from "fs";
import path from "path";
import { createRequire } from "module";
import csvParser from "csv-parser";
import Tesseract from "tesseract.js";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export const extractTextFromFile = async (file) => {
  const filePath = file.path;
  const ext = path.extname(file.originalname).toLowerCase();

  if (ext === ".pdf") {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (ext === ".txt") {
    return fs.readFileSync(filePath, "utf-8");
  }

  if (ext === ".csv") {
    return await extractCsvText(filePath);
  }

  if ([".png", ".jpg", ".jpeg"].includes(ext)) {
    const result = await Tesseract.recognize(filePath, "eng");
    return result.data.text;
  }

  throw new Error("Unsupported file type");
};

const extractCsvText = (filePath) => {
  return new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(filePath)
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