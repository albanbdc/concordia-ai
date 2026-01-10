// src/utils/pdf.ts
import jsPDF from "jspdf";

export const generatePDF = (text: string, color = { r: 0, g: 0, b: 0 }) => {
  const doc = new jsPDF();

  doc.setTextColor(color.r, color.g, color.b);
  doc.text(text, 10, 20);

  return doc;
};
