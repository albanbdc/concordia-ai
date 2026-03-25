"use client";

import { useEffect, useState } from "react";

type HistoryItem = {
  id: string;
  createdAt: string;
  eventType: string;
  actor: string | null;
  obligationId: string | null;
  useCaseKey: string | null;
  auditId: string | null;
  previousValue: string | null;
  newValue: string | null;
  proofId: string | null;
  txHash: string | null;
  prevHash: string | null;
  chained: boolean;
};

type Snapshot = {
  id: string;
  createdAt: string;
  headHash: string | null;
  actor: string | null;
};

type Organization = {
  id: string;
  name: string;
  sector: string | null;
  size: string | null;
  contactName: string | null;
};

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function shortHash(h?: string | null) {
  if (!h) return "—";
  if (h.length < 12) return h;
  return `${h.slice(0, 6)}…${h.slice(-6)}`;
}

export default function HistoryPage() {
  const [rows, setRows] = useState<HistoryItem[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [ledgerHead, setLedgerHead] = useState<string | null>(null);
  const [chainValid, setChainValid] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snapshotBusy, setSnapshotBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/history");
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;

      if (!res.ok) throw new Error(json?.error || `Erreur API (${res.status})`);

      setRows(Array.isArray(json?.history) ? json.history : []);
      setLedgerHead(json?.ledgerHead ?? null);
      setChainValid(json?.chainValid ?? true);

      const snapRes = await fetch("/api/history/snapshot");
      const snapText = await snapRes.text();
      const snapJson = snapText ? JSON.parse(snapText) : null;
      setSnapshots(Array.isArray(snapJson?.snapshots) ? snapJson.snapshots : []);

      const orgRes = await fetch("/api/organization");
      const orgText = await orgRes.text();
      const orgJson = orgText ? JSON.parse(orgText) : null;
      setOrganization(orgJson?.org ?? null);

    } catch (e: any) {
      setError(e?.message || "Erreur chargement journal");
    } finally {
      setLoading(false);
    }
  }

  async function takeSnapshot() {
    setSnapshotBusy(true);
    try {
      const res = await fetch("/api/history/snapshot", { method: "POST" });
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;

      if (!res.ok) throw new Error(json?.error || `Erreur API (${res.status})`);

      await load();
      alert("Snapshot enregistré ✅");
    } catch (e: any) {
      alert(e?.message || "Erreur snapshot");
    } finally {
      setSnapshotBusy(false);
    }
  }

  function isActiveSnapshot(s: Snapshot) {
    return ledgerHead && s.headHash && ledgerHead === s.headHash;
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6 space-y-6">

      {organization && (
        <div className="border border-slate-200 rounded-2xl p-4 bg-white">
          <div className="text-xs text-slate-500 mb-2">
            Entité juridique responsable du registre
          </div>
          <div className="text-sm text-slate-900">
            <strong>{organization.name}</strong>
            {organization.sector && <> — Secteur : {organization.sector}</>}
            {organization.size && <> — Taille : {organization.size}</>}
            {organization.contactName && <> — Contact : {organization.contactName}</>}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Journal Global — Registre de conformité vivant
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Historique horodaté de toutes les actions entreprises dans le cadre de la conformité IA Act.
          </p>
        </div>

        <button
          onClick={takeSnapshot}
          disabled={snapshotBusy}
          className="px-4 py-2 text-sm rounded-xl border border-slate-300 bg-white hover:bg-slate-50"
        >
          {snapshotBusy ? "Enregistrement…" : "Figer le registre"}
        </button>
      </div>

      <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500">Ledger Head</div>
          <div className="font-mono text-sm text-slate-900">
            {ledgerHead ? shortHash(ledgerHead) : "—"}
          </div>
        </div>
        <div>
          {chainValid ? (
            <span className="text-green-600 font-medium">✔️ Chain Valid</span>
          ) : (
            <span className="text-red-600 font-medium">❌ Chain Broken</span>
          )}
        </div>
      </div>

      <div className="border border-slate-200 rounded-2xl p-4">
        <div className="text-sm font-medium text-slate-900 mb-2">
          Snapshots enregistrés
        </div>

        {snapshots.length === 0 ? (
          <div className="text-xs text-slate-500">Aucun snapshot</div>
        ) : (
          <div className="space-y-2">
            {snapshots.map((s) => (
              <div key={s.id} className="flex justify-between text-xs items-center">
                <div>{formatDate(s.createdAt)}</div>
                <div className="font-mono">{shortHash(s.headHash)}</div>
                <div>{s.actor ?? "—"}</div>
                <div>
                  {isActiveSnapshot(s) ? (
                    <span className="text-green-600 font-medium">🟢 Snapshot actif</span>
                  ) : (
                    <span className="text-slate-400">Historique</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border border-slate-200 rounded-2xl p-4">
        <div className="text-sm font-medium text-slate-900 mb-2">
          Historique des actions
        </div>

        {rows.length === 0 ? (
          <div className="text-xs text-slate-500">Aucune action enregistrée</div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-2 py-1 text-left">Date</th>
                  <th className="px-2 py-1 text-left">Use Case</th>
                  <th className="px-2 py-1 text-left">Obligation</th>
                  <th className="px-2 py-1 text-left">Action</th>
                  <th className="px-2 py-1 text-left">Responsable</th>
                  <th className="px-2 py-1 text-left">Hash</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-2 py-1">{formatDate(r.createdAt)}</td>
                    <td className="px-2 py-1">{r.useCaseKey ?? "—"}</td>
                    <td className="px-2 py-1">{r.obligationId ?? "—"}</td>
                    <td className="px-2 py-1">{r.eventType}</td>
                    <td className="px-2 py-1">{r.actor ?? "CLIENT"}</td>
                    <td className="px-2 py-1 font-mono">{shortHash(r.txHash)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-xl p-3">
          {error}
        </div>
      )}

    </div>
  );
}