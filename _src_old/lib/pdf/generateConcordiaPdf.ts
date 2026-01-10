// src/lib/pdf/generateConcordiaPdf.ts

import { PDFDocument, StandardFonts } from "pdf-lib";

export async function generateConcordiaPdf(audit: any): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const { width, height } = page.getSize();

  const text = buildTextReport(audit);

  page.drawText(text, {
    x: 40,
    y: height - 40,
    size: 11,
    font,
    maxWidth: width - 80,
    lineHeight: 14,
  });

  return await pdfDoc.save();
}

function buildTextReport(audit: any): string {
  if (!audit) return "Aucun audit disponible.";

  const lines: string[] = [];

  lines.push("RAPPORT CONCORDIA");
  lines.push("=================");
  lines.push("");
  lines.push(`Système : ${audit.systemName ?? "—"}`);
  lines.push(`Statut : ${audit.systemStatus ?? "—"}`);
  lines.push(`Score : ${audit.score?.overallScore ?? "—"}/100`);
  lines.push("");

  if (Array.isArray(audit.useCases)) {
    for (const uc of audit.useCases) {
      lines.push(`Cas d’usage : ${uc.useCaseName}`);
      if (Array.isArray(uc.appliedObligations)) {
        for (const o of uc.appliedObligations) {
          lines.push(`- ${o.label}`);
        }
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}
