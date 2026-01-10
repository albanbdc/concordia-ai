import jsPDF from "jspdf";
import { ConcordiaStyle } from "./types";
import { concordiaDefaultStyle } from "./styles";

export class ConcordiaAuditPDF {
  private doc: jsPDF;
  private cursorY: number;
  private style: ConcordiaStyle;

  constructor(style: ConcordiaStyle = concordiaDefaultStyle) {
    this.doc = new jsPDF();
    this.style = style;

    // Position de départ sous le header
    this.cursorY = style.marginTop + 20;

    this.addHeader();
    this.addFooter();
  }

  // -----------------------------
  // HEADER
  // -----------------------------
  private addHeader() {
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(11);

    this.doc.text(
      "Concordia – Rapport d'audit IA",
      this.style.marginLeft,
      this.style.marginTop
    );

    // Ligne
    this.doc.setLineWidth(0.2);
    this.doc.line(
      this.style.marginLeft,
      this.style.marginTop + 5,
      this.doc.internal.pageSize.width - this.style.marginRight,
      this.style.marginTop + 5
    );
  }

  // -----------------------------
  // FOOTER
  // -----------------------------
  private addFooter() {
    const pageHeight = this.doc.internal.pageSize.height;
    const pageNumber = this.doc.getNumberOfPages();

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(10);

    // Ligne
    this.doc.setLineWidth(0.2);
    this.doc.line(
      this.style.marginLeft,
      pageHeight - this.style.marginBottom - 10,
      this.doc.internal.pageSize.width - this.style.marginRight,
      pageHeight - this.style.marginBottom - 10
    );

    this.doc.text(
      `Page ${pageNumber}`,
      this.style.marginLeft,
      pageHeight - this.style.marginBottom
    );

    this.doc.text(
      new Date().toLocaleDateString("fr-FR"),
      this.doc.internal.pageSize.width - this.style.marginRight - 25,
      pageHeight - this.style.marginBottom
    );
  }

  // -----------------------------
  // NOUVELLE PAGE
  // -----------------------------
  private newPage() {
    this.doc.addPage();
    this.addHeader();
    this.addFooter();
    this.cursorY = this.style.marginTop + 20;
  }

  // -----------------------------
  // CHECK DE PAGE
  // -----------------------------
  private checkPage(height: number) {
    const pageHeight = this.doc.internal.pageSize.height;

    if (this.cursorY + height > pageHeight - this.style.marginBottom - 15) {
      this.newPage();
    }
  }

  // -----------------------------
  // TITRE NIVEAU 1
  // -----------------------------
  addSectionTitle(text: string) {
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(16);

    this.checkPage(25);
    this.doc.text(text.toUpperCase(), this.style.marginLeft, this.cursorY);
    this.cursorY += 24;
  }

  // -----------------------------
  // TITRE NIVEAU 2
  // -----------------------------
  addSubsectionTitle(text: string) {
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(13);

    this.checkPage(20);
    this.doc.text(text, this.style.marginLeft, this.cursorY);
    this.cursorY += 18;
  }

  // -----------------------------
  // PARAGRAPHE
  // -----------------------------
  addParagraph(text: string) {
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(11);

    const maxWidth =
      this.doc.internal.pageSize.width -
      (this.style.marginLeft + this.style.marginRight);

    const lines = this.doc.splitTextToSize(text, maxWidth);
    const lineHeight = 7;

    this.checkPage(lines.length * lineHeight + 10);

    this.doc.text(lines, this.style.marginLeft, this.cursorY, {
      align: "justify",
    });

    this.cursorY += lines.length * lineHeight + 8;
  }

  // -----------------------------
  // LISTE À PUCE
  // -----------------------------
  addBullet(text: string) {
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(11);

    const maxWidth =
      this.doc.internal.pageSize.width -
      (this.style.marginLeft + this.style.marginRight + 6);

    const lines = this.doc.splitTextToSize(text, maxWidth);

    // Petit espace avant la puce
    this.cursorY += 3;

    this.checkPage(lines.length * 7 + 10);

    this.doc.circle(this.style.marginLeft + 1.5, this.cursorY - 2, 0.8, "F");

    this.doc.text(lines, this.style.marginLeft + 6, this.cursorY, {
      align: "justify",
    });

    this.cursorY += lines.length * 7 + 4;
  }

  // -----------------------------
  // ESPACE
  // -----------------------------
  addSpace(value: number = 10) {
    this.cursorY += value;
  }

  // -----------------------------
  // SAUVEGARDE
  // -----------------------------
  save(filename: string) {
    this.doc.save(filename);
  }
}
