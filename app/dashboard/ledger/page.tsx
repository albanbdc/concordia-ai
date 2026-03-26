"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type LedgerItem = {
  id: string;
  createdAt: string;
  type: string;
  message: string;
  actor?: string | null;
  txHash?: string | null;
  prevHash?: string | null;
  state: {
    obligationId: string;
    obligation?: {
      title: string;
      legalRef: string | null;
    } | null;
    useCase: {
      key: string;
      title: string;
    };
  };
};

type Snapshot = {
  id: string;
  createdAt: string;
  snapshotHash?: string | null;
  headHash?: string | null;
  historyCount?: number;
  sealed?: boolean;
  active?: boolean;
};

const LEGAL_ACTIONS: Record<string, string> = {
  PROOF_ADDED: "Preuve ajoutee",
  PROOF_REMOVED: "Preuve supprimee",
  STATUS_CHANGED: "Mise en conformite",
  AUDIT_LINKED: "Audit associe",
  SNAPSHOT_CREATED: "Gel du registre",
};

function sanitize(str: string): string {
  return str
    .replace(/é|è|ê|ë/g, "e")
    .replace(/à|â|ä/g, "a")
    .replace(/î|ï/g, "i")
    .replace(/ô|ö/g, "o")
    .replace(/ù|û|ü/g, "u")
    .replace(/ç/g, "c")
    .replace(/É|È|Ê|Ë/g, "E")
    .replace(/À|Â|Ä/g, "A")
    .replace(/Î|Ï/g, "I")
    .replace(/Ô|Ö/g, "O")
    .replace(/Ù|Û|Ü/g, "U")
    .replace(/Ç/g, "C")
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae");
}

function actionLabel(i: LedgerItem) {
  return LEGAL_ACTIONS[i.type] ?? i.type;
}

function LedgerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const snapshotId = searchParams.get("snapshotId");

  const [items, setItems] = useState<LedgerItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [expandedHash, setExpandedHash] = useState<string | null>(null);
  const [chainValid, setChainValid] = useState<boolean>(true);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [viewingSnapshot, setViewingSnapshot] = useState<Snapshot | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  async function load() {
    const url = snapshotId ? `/api/ledger?snapshotId=${snapshotId}` : `/api/ledger`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.ok) {
      setItems(data.history);
      setChainValid(data.chainValid);
      setSnapshot(data.snapshot ?? null);
      setViewingSnapshot(data.viewingSnapshot ?? null);
      setSnapshots(data.snapshots ?? []);
      setOrganizationName(data.organizationName ?? null);
    }
  }

  useEffect(() => {
    load();
  }, [snapshotId]);

  async function createSnapshot() {
    setBusy(true);
    await fetch("/api/history", { method: "POST" });
    await load();
    setBusy(false);
  }

  function goLive() {
    router.push("/dashboard/ledger");
  }

  function openSnapshot(id: string) {
    router.push(`/dashboard/ledger?snapshotId=${id}`);
  }

  async function exportPDF() {
    setPdfBusy(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 15;
      const colW = pageW - margin * 2;

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageW, 24, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("CONCORDIA", margin, 11);

      if (organizationName) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(148, 163, 184);
        doc.text(sanitize(organizationName), margin, 18);
      }

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      doc.text("Registre de conformite vivant - Ledger probatoire", margin + 52, 11);

      const now = new Date().toLocaleString("fr-FR");
      doc.text(`Genere le : ${now}`, pageW - margin, 11, { align: "right" });

      let y = 32;
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");

      if (viewingSnapshot) {
        doc.text(`Snapshot fige - ${new Date(viewingSnapshot.createdAt).toLocaleString("fr-FR")}`, margin, y);
      } else {
        doc.text("Registre vivant (vue courante)", margin, y);
      }

      y += 10;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(`Evenements : ${filtered.length}`, margin, y);
      doc.text(`Integrite : ${chainValid ? "100%" : "ALERTE"}`, margin + 40, y);
      doc.text(`Dernier hash : ${lastHash?.slice(0, 32) ?? "-"}...`, margin + 80, y);

      y += 6;
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y, pageW - margin, y);

      y += 8;
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y - 5, colW, 8, "F");

      doc.setTextColor(71, 85, 105);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");

      const cols = [
        { label: "Date", x: margin + 2, w: 35 },
        { label: "Use Case", x: margin + 38, w: 45 },
        { label: "Obligation", x: margin + 84, w: 70 },
        { label: "Action", x: margin + 155, w: 35 },
        { label: "Responsable", x: margin + 191, w: 40 },
        { label: "Hash", x: margin + 232, w: 30 },
      ];

      cols.forEach((c) => doc.text(c.label, c.x, y));
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);

      filtered.forEach((item, idx) => {
        if (y > pageH - 20) {
          doc.addPage();
          y = 20;
          doc.setFillColor(241, 245, 249);
          doc.rect(margin, y - 5, colW, 8, "F");
          doc.setFont("helvetica", "bold");
          doc.setTextColor(71, 85, 105);
          cols.forEach((c) => doc.text(c.label, c.x, y));
          doc.setFont("helvetica", "normal");
          y += 6;
        }

        if (idx % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, y - 4, colW, 7, "F");
        }

        doc.setTextColor(15, 23, 42);

        const date = new Date(item.createdAt).toLocaleString("fr-FR");
        const useCase = sanitize(item.state.useCase.title).slice(0, 22);
        const obligation = sanitize(item.state.obligation?.title ?? item.state.obligationId).slice(0, 38);
        const action = sanitize(actionLabel(item)).slice(0, 20);
        const actor = sanitize(item.actor ?? "CLIENT").slice(0, 22);
        const hash = item.txHash?.slice(0, 14) ?? "-";

        doc.text(date, cols[0].x, y);
        doc.text(useCase, cols[1].x, y);
        doc.text(obligation, cols[2].x, y);
        doc.text(action, cols[3].x, y);
        doc.text(actor, cols[4].x, y);

        doc.setFont("courier", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(hash + "...", cols[5].x, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(15, 23, 42);

        y += 7;
      });

      const totalPages = (doc.internal as any).getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Concordia - Registre de conformite AI Act (UE) 2024/1689 - Page ${p}/${totalPages}`,
          pageW / 2,
          pageH - 6,
          { align: "center" }
        );
      }

      const filename = viewingSnapshot
        ? `concordia-ledger-snapshot-${new Date(viewingSnapshot.createdAt).toISOString().slice(0, 10)}.pdf`
        : `concordia-ledger-${new Date().toISOString().slice(0, 10)}.pdf`;

      doc.save(filename);
    } catch (e) {
      console.error("Erreur export PDF", e);
    } finally {
      setPdfBusy(false);
    }
  }

  const filtered = items
    .filter((i) => Object.keys(LEGAL_ACTIONS).includes(i.type))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const integrityScore = chainValid ? 100 : 0;
  const lastHash = filtered.length > 0 ? filtered[filtered.length - 1].txHash : null;

  return (
    <div className="p-8 space-y-8">
      {viewingSnapshot && (
        <div className="border border-blue-300 bg-blue-50 rounded-xl p-4 flex justify-between items-center">
          <div>
            <div className="font-semibold">🧊 Mode snapshot figé</div>
            <div className="text-xs text-slate-600">
              Lecture du registre au {new Date(viewingSnapshot.createdAt).toLocaleString()}
            </div>
          </div>
          <button onClick={goLive} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
            Revenir au live
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ledger – Registre de conformité vivant</h1>
          <p className="text-sm text-slate-500">Historique probatoire append-only</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHelp(true)}
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 transition font-bold text-sm flex items-center justify-center"
          >
            ?
          </button>
          <button
            onClick={exportPDF}
            disabled={pdfBusy || filtered.length === 0}
            className="border border-slate-200 bg-white text-slate-900 px-5 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 disabled:opacity-40"
          >
            {pdfBusy ? "Export..." : "⬇ Exporter PDF"}
          </button>
          {!viewingSnapshot && (
            <button
              onClick={createSnapshot}
              disabled={busy}
              className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm"
            >
              {busy ? "Gel en cours..." : "Geler le registre"}
            </button>
          )}
        </div>
      </div>

      {snapshots.length > 0 && (
        <div className="border rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">📜 Historique des snapshots</h2>
          <div className="space-y-3">
            {snapshots.map((s) => (
              <div key={s.id} className="flex items-center justify-between border rounded-xl p-4">
                <div>
                  <div className="font-semibold">🧊 {new Date(s.createdAt).toLocaleString()}</div>
                  <div className="font-mono text-xs text-slate-500">{s.snapshotHash?.slice(0, 20)}...</div>
                </div>
                <div className="flex items-center gap-3">
                  {s.active && <span className="text-green-600 text-xs font-semibold">Actif</span>}
                  <button onClick={() => openSnapshot(s.id)} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-xs">
                    Voir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="border rounded-xl p-4">
          <div className="text-xs text-slate-500">Événements</div>
          <div className="text-2xl font-bold">{filtered.length}</div>
        </div>
        <div className="border rounded-xl p-4">
          <div className="text-xs text-slate-500">Intégrité</div>
          <div className={`text-2xl font-bold ${integrityScore === 100 ? "text-green-600" : "text-red-600"}`}>
            {integrityScore}%
          </div>
        </div>
        <div className="border rounded-xl p-4">
          <div className="text-xs text-slate-500">Dernier hash</div>
          <div className="font-mono text-xs break-all">{lastHash ?? "—"}</div>
        </div>
      </div>

      <div className="overflow-auto border rounded-2xl">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-3 text-left">✔</th>
              <th className="px-3 py-3 text-left">Date</th>
              <th className="px-3 py-3 text-left">Use Case</th>
              <th className="px-3 py-3 text-left">Obligation</th>
              <th className="px-3 py-3 text-left">Action</th>
              <th className="px-3 py-3 text-left">Responsable</th>
              <th className="px-3 py-3 text-left">Hash</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => {
              const expanded = expandedHash === i.id;
              return (
                <tr key={i.id} className="border-t">
                  <td className="px-3 py-2">{chainValid ? "🟢" : "🔴"}</td>
                  <td className="px-3 py-2">{new Date(i.createdAt).toLocaleString()}</td>
                  <td className="px-3 py-2">{i.state.useCase.title}</td>
                  <td className="px-3 py-2">
                    <div className="font-semibold text-slate-900">
                      {i.state.obligation?.title ?? i.state.obligationId}
                    </div>
                    {i.state.obligation?.legalRef && (
                      <div className="text-xs text-slate-500">{i.state.obligation.legalRef}</div>
                    )}
                  </td>
                  <td className="px-3 py-2 font-semibold">{actionLabel(i)}</td>
                  <td className="px-3 py-2">{i.actor || "CLIENT"}</td>
                  <td
                    className="px-3 py-2 font-mono text-xs cursor-pointer"
                    onClick={() => setExpandedHash(expanded ? null : i.id)}
                  >
                    {expanded ? i.txHash : `${i.txHash?.slice(0, 12)}...`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowHelp(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Concordia</div>
                <h2 className="text-lg font-bold text-slate-900">Le Ledger probatoire</h2>
              </div>
              <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-slate-700 transition text-xl shrink-0">✕</button>
            </div>
            <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
              <p>
                Le ledger est le <span className="font-semibold text-slate-900">registre central de toutes vos actions de conformité</span>.
                Chaque événement est enregistré de façon permanente et inaltérable.
              </p>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                {[
                  { icon: "🔒", title: "Append-only", desc: "Aucune entrée ne peut être modifiée ou supprimée rétroactivement." },
                  { icon: "🔗", title: "Chaîne SHA-256", desc: "Chaque entrée est liée cryptographiquement à la précédente." },
                  { icon: "⏱️", title: "Horodatage", desc: "Chaque action est datée au moment exact de son enregistrement." },
                  { icon: "🧊", title: "Snapshots", desc: "Vous pouvez geler l'état du registre à tout moment." },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <span className="text-base shrink-0">{item.icon}</span>
                    <div>
                      <div className="font-semibold text-slate-900 text-xs mb-0.5">{item.title}</div>
                      <div className="text-xs text-slate-500">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setShowHelp(false)} className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black transition">
              Compris
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LedgerPage() {
  return (
    <Suspense fallback={<div className="p-8">Chargement...</div>}>
      <LedgerContent />
    </Suspense>
  );
}
