export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!(session?.user as any)?.organizationId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const organizationId = (session!.user as any).organizationId;

    const states = await prisma.useCaseObligationState.findMany({
      where: { useCase: { organizationId } },
      include: {
        useCase: true,
        proofs: true,
      },
    });

    const catalog = await prisma.obligationCatalog.findMany();
    const catalogMap = new Map(catalog.map((o) => [o.id, o.title]));

    // ================= GROUP BY USE CASE =================
    const grouped = new Map<string, any[]>();

    for (const s of states) {
      const key = s.useCase?.title ?? "UNKNOWN";
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(s);
    }

    // ================= PDF =================
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    function safe(text: string) {
      return (text || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\x00-\x7F]/g, "");
    }

    function newPage() {
      page = pdfDoc.addPage([600, 800]);
      y = 750;
    }

    function draw(label: string, value: string, indent = 0) {
      if (y < 50) newPage();
      page.drawText(`${safe(label)}: ${safe(value)}`, {
        x: 50 + indent,
        y,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });
      y -= 14;
    }

    // ================= PAGE 1 = SYNTHÈSE =================
    let page = pdfDoc.addPage([600, 800]);
    let y = 750;

page.drawText("DOSSIER CONFORMITE IA", {
  x: 50,
  y,
  size: 18,
  font,
});
y -= 20;

const snapshot = await prisma.ledgerSnapshot.findFirst({
  where: { organizationId, active: true },
  orderBy: { createdAt: "desc" },
});

draw("Snapshot date", snapshot?.createdAt?.toISOString() ?? "-");
draw("Snapshot hash", snapshot?.headHash ?? "-");

y -= 20;

    // ================= PAGES PAR USECASE =================
    for (const [useCaseTitle, obligations] of grouped.entries()) {
      newPage();

      page.drawText(safe(`SYSTEME IA : ${useCaseTitle}`), {
        x: 50,
        y,
        size: 14,
        font,
      });

      y -= 30;

      let compliant = 0;
      let inProgress = 0;
      let nonCompliant = 0;

      for (const s of obligations) {
        if (s.status === "COMPLIANT") compliant++;
        else if (s.status === "IN_PROGRESS") inProgress++;
        else if (s.status === "NON_COMPLIANT") nonCompliant++;
      }

      draw("Conformes", compliant.toString());
      draw("En cours", inProgress.toString());
      draw("Non conformes", nonCompliant.toString());

      y -= 20;

for (const s of obligations) {
  const obligationTitle =
    catalogMap.get(s.obligationId) ?? s.obligationId;

  if (y < 100) newPage();

  // BOX
  page.drawRectangle({
    x: 45,
    y: y - 5,
    width: 510,
    height: 90,
    borderWidth: 1,
    borderColor: rgb(0.85, 0.85, 0.85),
  });

  draw("OBLIGATION", obligationTitle, 5);
  const statusColor =
  s.status === "COMPLIANT"
    ? rgb(0, 0.6, 0)
    : s.status === "IN_PROGRESS"
    ? rgb(0.8, 0.5, 0)
    : rgb(0.8, 0, 0);

if (y < 50) newPage();
page.drawText(`Statut: ${safe(s.status.toUpperCase())}`, {
  x: 65,
  y,
  size: 10,
  font,
  color: statusColor,
});
y -= 14;
  draw("Responsable", s.owner ?? "-", 15);
  draw(
    "Deadline",
    s.dueDate ? new Date(s.dueDate).toLocaleDateString() : "-",
    15
  );

  if (Array.isArray(s.proofs) && s.proofs.length > 0) {
    draw("Preuves liees", "", 15);
    for (const p of s.proofs) {
      const icon = p.type === "DOCUMENT" ? "[DOC]" : "[LINK]";
      draw(`${icon} ${p.label ?? p.url}`, "", 25);
    }
  } else {
    draw("Preuves", "Aucune", 15);
  }

  y -= 20;
}
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'attachment; filename="concordia-dossier.pdf"',
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "EXPORT_ERROR" },
      { status: 500 }
    );
  }
}