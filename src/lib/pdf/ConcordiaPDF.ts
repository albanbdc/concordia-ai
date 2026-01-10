import jsPDF from "jspdf";
import { ConcordiaStyle } from "./types";
import { concordiaDefaultStyle } from "./styles";

export class ConcordiaPDF {
  private doc: jsPDF;
  private cursorY: number;
  private style: ConcordiaStyle;

  constructor(style: ConcordiaStyle = concordiaDefaultStyle) {
    this.doc = new jsPDF();
    this.style = style;

    // Démarrage propre
    this.cursorY = this.style.marginTop + 20; 
    this.addHeader();
    this.addFooter();
  }

  // ------------------------------------------
  // HEADER
  // ------------------------------------------
  private addHeader() {
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(11);

    this.doc.text(
      "Concordia – Document généré automatiquement",
      this.style.marginLeft,
      this.style.marginTop
    );

    // Ligne sous le header
    this.doc.setLineWidth(0.2);
    this.doc.line(
      this.style.marginLeft,
      this.style.marginTop + 5,
      this.doc.internal.pageSize.width - this.style.marginRight,
      this.style.marginTop + 5
    );
  }

  // ------------------------------------------
  // FOOTER
  // ------------------------------------------
  private addFooter() {
    const pageHeight = this.doc.internal.pageSize.height;

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(10);

    // Ligne au-dessus du footer
    this.doc.setLineWidth(0.2);
    this.doc.line(
      this.style.marginLeft,
      pageHeight - this.style.marginBottom - 10,
      this.doc.internal.pageSize.width - this.style.marginRight,
      pageHeight - this.style.marginBottom - 10
    );

    const pageNumber = this.doc.getNumberOfPages();

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

  // ------------------------------------------
  // NOUVELLE PAGE
  // ------------------------------------------
  private newPage() {
    this.doc.addPage();
    this.addHeader();
    this.addFooter();
    this.cursorY = this.style.marginTop + 15;
  }

  // ------------------------------------------
  // VÉRIFICATION AVANT D'AJOUTER DU CONTENU
  // ------------------------------------------
  private checkPage(heightNeeded: number) {
    const pageHeight = this.doc.internal.pageSize.height;
    const maxY = pageHeight - this.style.marginBottom - 15;

    if (this.cursorY + heightNeeded > maxY) {
      this.newPage();
    }
  }

  // ------------------------------------------
  // TITRE
  // ------------------------------------------
  addTitle(text: string) {
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(this.style.titleSize);

    this.checkPage(this.style.titleSize + 10);

    this.doc.text(text, this.style.marginLeft, this.cursorY);
    this.cursorY += this.style.titleSize + 8;
  }

  // ------------------------------------------
  // SOUS-TITRE
  // ------------------------------------------
  addSubtitle(text: string) {
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(this.style.subtitleSize);

    this.checkPage(this.style.subtitleSize + 8);

    this.doc.text(text, this.style.marginLeft, this.cursorY);
    this.cursorY += this.style.subtitleSize + 6;
  }

  // ------------------------------------------
  // PARAGRAPHE JUSTIFIÉ
  // ------------------------------------------
  addParagraph(text: string) {
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(this.style.paragraphSize);

    const maxWidth =
      this.doc.internal.pageSize.width -
      (this.style.marginLeft + this.style.marginRight);

    const lines = this.doc.splitTextToSize(text, maxWidth);
    const lineHeight = this.style.paragraphSize + 2;

    this.checkPage(lines.length * lineHeight);

    this.doc.text(lines, this.style.marginLeft, this.cursorY, {
      align: "justify"
    });

    this.cursorY += lines.length * lineHeight + 4;
  }

  // ------------------------------------------
  // LISTE À PUCE
  // ------------------------------------------
  addBulletPoint(text: string) {
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(this.style.paragraphSize);

    const maxWidth =
      this.doc.internal.pageSize.width -
      (this.style.marginLeft + this.style.marginRight + 5);

    const lines = this.doc.splitTextToSize(text, maxWidth);

    this.checkPage(lines.length * (this.style.paragraphSize + 3));

    // Puce
    this.doc.circle(
      this.style.marginLeft + 2,
      this.cursorY - 2,
      0.8,
      "F"
    );

    this.doc.text(
      lines,
      this.style.marginLeft + 6,
      this.cursorY,
      { align: "justify" }
    );

    this.cursorY += lines.length * (this.style.paragraphSize + 3);
  }

  // ------------------------------------------
  // ESPACE
  // ------------------------------------------
  addSpace(size: number = 10) {
    this.cursorY += size;
  }

  // ------------------------------------------
  // SAUVEGARDE
  // ------------------------------------------
  save(filename: string) {
    this.doc.save(filename);
  }

  getDocument(): jsPDF {
    return this.doc;
  }
}
