import React, { useState } from "react";
import { ConcordiaAuditPDF } from "@/lib/pdf/ConcordiaAuditPDF.ts";

const PDFEditor: React.FC = () => {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [paragraph, setParagraph] = useState("");

  const generatePDF = () => {
    const pdf = new ConcordiaAuditPDF();

    // Titre principal
    if (title.trim()) {
      pdf.addSectionTitle(title);
    }

    // Sous-titre
    if (subtitle.trim()) {
      pdf.addSubsectionTitle(subtitle);
    }

    // Paragraphe
    if (paragraph.trim()) {
      pdf.addParagraph(paragraph);
    }

    pdf.save("concordia-document.pdf");
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md">
      {/* Title input */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Titre</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Saisis ton titre..."
        />
      </div>

      {/* Subtitle input */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Sous-titre</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Saisis ton sous-titre..."
        />
      </div>

      {/* Paragraph input */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Paragraphe</label>
        <textarea
          className="w-full border rounded px-3 py-2 h-32"
          value={paragraph}
          onChange={(e) => setParagraph(e.target.value)}
          placeholder="Écris ton contenu..."
        />
      </div>

      {/* Button */}
      <button
        onClick={generatePDF}
        className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition"
      >
        Générer le PDF
      </button>
    </div>
  );
};

export default PDFEditor;
