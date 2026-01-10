"use client";

import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";

type AuditPdfButtonProps = {
  audit: any; // on laisse souple pour éviter les erreurs de typage
};

// Couleurs style corporate
const COLOR_MARINE = { r: 15, g: 23, b: 42 };
const COLOR_TEAL = { r: 56, g: 189, b: 248 };
const COLOR_YELLOW = { r: 234, g: 179, b: 8 };
const COLOR_MUTED = { r: 100, g: 116, b: 139 };
const COLOR_HIGHLIGHT = { r: 241, g: 245, b: 249 };

function setFill(doc: jsPDF, c: { r: number; g: number; b: number }) {
  doc.setFillColor(c.r, c.g, c.b);
}
function setText(doc: jsPDF, c: { r: number; g: number; b: number }) {
  doc.setTextColor(c.r, c.g, c.b);
}
function setDraw(doc: jsPDF, c: { r: number; g: number; b: number }) {
  doc.setDrawColor(c.r, c.g, c.b);
}

// Bandeau léger derrière un titre
function drawHighlightedTitle(
  doc: jsPDF,
  text: string,
  y: number,
  options?: { main?: boolean }
) {
  const isMain = options?.main ?? false;
  const height = isMain ? 9 : 7;
  const paddingX = 3;

  setFill(doc, COLOR_HIGHLIGHT);
  setDraw(doc, { r: 226, g: 232, b: 240 });
  doc.rect(18, y - height + 3, 174, height, "F");

  setText(doc, COLOR_MARINE);
  doc.setFont("helvetica", isMain ? "bold" : "bold");
  doc.setFontSize(isMain ? 13 : 11);
  doc.text(text, 20 + paddingX, y);
}

// Essaie d'extraire un score "xx / 100" du texte d'analyse
function extractScore(text: string): string {
  if (!text) return "N/A";
  const match = text.match(/(\d{1,3})\s*\/\s*100/);
  if (!match) return "N/A";
  const n = parseInt(match[1], 10);
  if (isNaN(n) || n < 0 || n > 100) return "N/A";
  return `${n} / 100`;
}

// Essaie de trouver une phrase de risque principal
function extractMainRisk(text: string): string {
  if (!text) {
    return "Risque principal non explicite dans l'analyse. Une revue humaine est recommandee.";
  }

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const riskLine = lines.find((l) => /risque/i.test(l));
  if (riskLine) return riskLine;

  const redFlagLine = lines.find((l) => /red flag/i.test(l));
  if (redFlagLine) return redFlagLine;

  return lines[0] ?? "Risque principal non explicite dans l'analyse.";
}

// Synthèse courte depuis le texte global
function extractShortSummary(text: string): string {
  if (!text) return "Synthese non disponible dans l'analyse.";
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 400) return cleaned;
  return cleaned.slice(0, 380) + "...";
}

// Extrait la section "7 - SCORE DE CONFORMITÉ DÉTAILLÉ" si elle existe
function extractScoreDetailSection(text: string): string {
  if (!text) return "";
  const markers = [
    "7 - SCORE DE CONFORMITÉ DÉTAILLÉ",
    "7 - SCORE DE CONFORMITE DETAILLE",
    "7 - SCORE DE CONFORMITÉ DÉTAILLE",
  ];

  let start = -1;
  let chosenMarker = "";
  for (const m of markers) {
    const idx = text.indexOf(m);
    if (idx !== -1) {
      start = idx;
      chosenMarker = m;
      break;
    }
  }
  if (start === -1) return "";

  // Cherche un éventuel heading suivant "8 - "
  let end = text.indexOf("\n8 - ");
  if (end === -1) end = text.length;

  const section = text.slice(start, end).trim();
  if (!section) return "";

  // On enlève le "7 - ..." pour ne pas casser notre numérotation 1.3
  const withoutHeader = section.replace(chosenMarker, "").trim();
  return withoutHeader;
}

function exportAuditPdf(audit: any) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const now = new Date();
  const dateStr = now.toLocaleString("fr-FR");

  const resultText: string = audit.resultText || "";
  const inputText: string = audit.inputText || "";
  const score = extractScore(resultText);
  const mainRisk = extractMainRisk(resultText);
  const shortSummary = extractShortSummary(resultText);
  const scoreDetailSection = extractScoreDetailSection(resultText);

  const sector = audit.industrySector || "Non precise";
  const useCase = audit.useCaseType || "Non precise";
  const department = audit.internalDepartment || "Non precise";
  const auditType = audit.type || "Audit IA";
  const title =
    audit.title ||
    "Audit de conformite IA pour un systeme d'IA de l'organisation";

  // =============== PAGE 1 – COUVERTURE ===============
  setFill(doc, COLOR_MARINE);
  doc.rect(0, 0, 210, 22, "F");

  setText(doc, { r: 255, g: 255, b: 255 });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("CONCORDIA - AI Governance", 15, 14);

  setFill(doc, COLOR_TEAL);
  doc.rect(0, 285, 210, 5, "F");

  setText(doc, COLOR_MARINE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Audit de conformite IA - Rapport d'audit", 20, 40);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(title, 20, 48);

  // Bloc contexte
  setFill(doc, { r: 248, g: 250, b: 252 });
  setDraw(doc, { r: 226, g: 232, b: 240 });
  doc.rect(20, 60, 115, 55, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setText(doc, COLOR_MARINE);
  doc.text("Contexte du systeme IA", 24, 67);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setText(doc, COLOR_MARINE);

  const contextLines: string[] = [
    `Secteur : ${sector}`,
    `Usage IA : ${useCase}`,
    `Departement : ${department}`,
    `Type d'audit : ${auditType}`,
    `Date du rapport : ${dateStr}`,
  ];

  let yContext = 74;
  contextLines.forEach((line: string) => {
    doc.text(line, 24, yContext);
    yContext += 5;
  });

  // Bloc score / badge
  setFill(doc, { r: 248, g: 250, b: 252 });
  setDraw(doc, { r: 226, g: 232, b: 240 });
  doc.rect(140, 60, 50, 55, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  setText(doc, COLOR_MARINE);
  doc.text("Score global", 145, 68);

  setDraw(doc, COLOR_TEAL);
  doc.setLineWidth(0.6);
  doc.circle(165, 82, 12);

  setText(doc, COLOR_MARINE);
  doc.setFontSize(11);
  doc.text(score, 165, 83, { align: "center" });

  setFill(doc, COLOR_YELLOW);
  setText(doc, COLOR_MARINE);
  doc.setFontSize(8);
  doc.roundedRect(145, 96, 40, 7, 2, 2, "F");
  doc.text("Resultat de l'audit", 165, 101, { align: "center" });

  // Rappel du cas étudié (texte saisi) + risque principal
  const rappelTop = 132;

  setFill(doc, { r: 248, g: 250, b: 252 });
  setDraw(doc, { r: 226, g: 232, b: 240 });
  doc.rect(20, rappelTop, 170, 46, "F");

  // Rappel du cas étudié
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setText(doc, COLOR_MARINE);
  doc.text("Rappel du cas etudie", 24, rappelTop + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const pitch =
    inputText ||
    "Description du cas non renseignee dans l'interface au moment de l'audit.";
  const pitchLines = doc.splitTextToSize(pitch, 160);

  let yPitch = rappelTop + 12;
  pitchLines.forEach((line: string) => {
    doc.text(line, 24, yPitch);
    yPitch += 4;
  });

  // Risque principal
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Risque principal identifie", 24, yPitch + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const mainRiskLines = doc.splitTextToSize(mainRisk, 160);
  let yRisk = yPitch + 9;
  mainRiskLines.forEach((line: string) => {
    doc.text(line, 24, yRisk);
    yRisk += 4;
  });

  // Note
  const noteY = Math.max(yRisk + 8, rappelTop + 50);
  setText(doc, COLOR_MUTED);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text(
    "Ce rapport est genere automatiquement a partir des informations saisies dans Concordia et doit etre complete par une revue humaine.",
    20,
    noteY
  );

  // =============== PAGE 2 – SYNTHESE EXECUTIVE + SCORE DETAILLE ===============
  doc.addPage();
  let y = 30;

  // 1. Synthèse executive (titre principal surligné)
  drawHighlightedTitle(doc, "1. Synthese executive", y, { main: true });
  y += 10;

  // 1.1 Synthèse générale
  drawHighlightedTitle(doc, "1.1 Synthese generale de l'audit", y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setText(doc, COLOR_MARINE);

  const summaryLines = doc.splitTextToSize(shortSummary, 170);
  summaryLines.forEach((line: string) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, 20, y);
    y += 4;
  });

  y += 6;

  // 1.2 Éléments clés
  if (y > 230) {
    doc.addPage();
    y = 30;
  }
  drawHighlightedTitle(doc, "1.2 Elements clefs pour la direction", y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const bullets = [
    "Ce rapport restitue une analyse structuree du systeme d'IA et de ses principaux risques.",
    "Les recommandations issues de l'audit permettent de prioriser les actions a court terme.",
    "Une validation par les equipes metier, juridique, conformite / risque reste indispensable.",
  ];

  bullets.forEach((b) => {
    const lines = doc.splitTextToSize("- " + b, 170);
    lines.forEach((line: string) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += 4;
    });
    y += 2;
  });

  y += 6;

  // 1.3 Score de conformité détaillé (extrait de la partie 7)
  if (y > 220) {
    doc.addPage();
    y = 30;
  }
  drawHighlightedTitle(doc, "1.3 Score de conformite detaille (extrait)", y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const scoreBlock =
    scoreDetailSection ||
    "Les details du score de conformite n'ont pas pu etre extraits automatiquement. Verifiez la section 7 de l'audit complet dans Concordia.";

  const scoreLines = doc.splitTextToSize(scoreBlock, 170);
  scoreLines.forEach((line: string) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, 20, y);
    y += 4;
  });

  // =============== PAGE 3 – ANALYSE DETAILLEE COMPLETE ===============
  doc.addPage();
  y = 30;

  drawHighlightedTitle(
    doc,
    "2. Analyse detaillee - Contenu complet de l'audit",
    y,
    { main: true }
  );
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setText(doc, COLOR_MARINE);

  const fullText =
    resultText ||
    "Aucun contenu d'analyse trouve dans cet audit. Verifiez que l'appel a l'IA s'est bien deroule et que le texte de resultat a ete enregistre.";
  const fullLines = doc.splitTextToSize(fullText, 170);

  fullLines.forEach((line: string) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, 20, y);
    y += 4;
  });

  // Pagination
  const anyDoc: any = doc;
  const pageCount = anyDoc.getNumberOfPages
    ? anyDoc.getNumberOfPages()
    : 1;

  for (let i = 1; i <= pageCount; i++) {
    anyDoc.setPage(i);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    setText(doc, COLOR_MUTED);
    doc.text(
      `Concordia - Audit de conformite IA - Page ${i} / ${pageCount}`,
      20,
      290
    );
  }

  const fileName = audit.id
    ? `concordia-audit-${audit.id}.pdf`
    : "concordia-audit.pdf";

  doc.save(fileName);
}

export function AuditPdfButton({ audit }: AuditPdfButtonProps) {
  if (!audit) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      type="button"
      onClick={() => exportAuditPdf(audit)}
    >
           TEST PDF V3

    </Button>
  );
}

export default AuditPdfButton;
