// app/dashboard/obligations/ObligationsClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ObligationDrawerClient from "./ObligationDrawerClient";

/* ========= TYPES ========= */

type CatalogObligation = {
  id: string;
  title: string;
  description: string;
  legalRef: string;
  category: string;
  criticality: string;
};

type Row = {
  id: string;
  obligationId: string;
  obligation?: CatalogObligation | null;
  status: string;
  priority: string;
  owner?: string | null;
  dueDate?: string | null;
  notes?: string | null;
  updatedAt?: string;
  historyPreview?: any[];
};

type ApiObligations =
  | { ok: true; useCaseKey: string; obligations: Row[] }
  | { ok: false; error: string };

type UseCaseItem = {
  key: string;
  title: string;
  sector: string;
  updatedAt: string;
  counts?: {
    total: number;
    nonCompliant: number;
    inProgress: number;
    compliant: number;
  };
};

type ApiUseCases =
  | { ok: true; useCases: UseCaseItem[] }
  | { ok: false; error: string };

const LS_KEY = "concordia:lastUseCaseKey";

/* ========= HELPERS ========= */

function prettyDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("fr-FR");
  } catch {
    return iso;
  }
}

function badge(status: string) {
  const v = String(status || "");
  const cls =
    v === "COMPLIANT"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : v === "IN_PROGRESS"
      ? "bg-amber-50 text-amber-800 border-amber-200"
      : v === "NON_COMPLIANT"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${cls}`}>
      {v}
    </span>
  );
}

function obligationLabel(r: Row) {
  if (r.obligation?.title) {
    return {
      main: r.obligation.title,
      sub: r.obligation.legalRef ?? null,
    };
  }
  return { main: r.obligationId, sub: null };
}

/* ========= COMPONENT ========= */

export default function ObligationsClient() {
  const searchParams = useSearchParams();
  const urlUseCaseKey = searchParams.get("useCaseKey");

  const [useCases, setUseCases] = useState<UseCaseItem[]>([]);
  const [useCasesLoading, setUseCasesLoading] = useState(false);

  const [selectedUseCaseKey, setSelectedUseCaseKey] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);

  /* -------- Load UseCases -------- */
  useEffect(() => {
    let alive = true;

    async function loadUseCases() {
      setUseCasesLoading(true);
      try {
        const res = await fetch("/api/usecases?limit=200");
        const data: ApiUseCases = await res.json();
        if (!data.ok) throw new Error(data.error);

        if (!alive) return;
        setUseCases(data.useCases);

        // ✅ PRIORITÉ URL → sinon localStorage → sinon premier
        const urlKey = urlUseCaseKey ? String(urlUseCaseKey) : "";
        const urlExists = urlKey && data.useCases.some((u) => u.key === urlKey);

        if (urlExists) {
          setSelectedUseCaseKey(urlKey);
          localStorage.setItem(LS_KEY, urlKey);
          return;
        }

        const last = localStorage.getItem(LS_KEY);
        const fallback =
          (last && data.useCases.find((u) => u.key === last)?.key) ??
          data.useCases[0]?.key ??
          "";

        setSelectedUseCaseKey(fallback);
      } catch {
        if (!alive) return;
        setUseCases([]);
      } finally {
        if (!alive) return;
        setUseCasesLoading(false);
      }
    }

    loadUseCases();
    return () => {
      alive = false;
    };
  }, [urlUseCaseKey]);

  /* -------- Load Obligations -------- */
  useEffect(() => {
    if (!selectedUseCaseKey) return;
    let alive = true;

    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`/api/obligations?useCaseKey=${encodeURIComponent(selectedUseCaseKey)}`);
        const data: ApiObligations = await res.json();
        if (!data.ok) throw new Error(data.error);

        if (!alive) return;
        setRows(data.obligations);
        localStorage.setItem(LS_KEY, selectedUseCaseKey);
      } catch (e: any) {
        if (!alive) return;
        setRows([]);
        setErr(e?.message || "Erreur chargement obligations");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [selectedUseCaseKey]);

  const sorted = useMemo(() => [...rows], [rows]);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Registre de conformité vivant</h1>

      <select
        value={selectedUseCaseKey}
        onChange={(e) => setSelectedUseCaseKey(e.target.value)}
        className="w-full max-w-xl rounded-lg border px-3 py-2 text-sm"
        disabled={useCasesLoading}
      >
        {useCases.map((u) => (
          <option key={u.key} value={u.key}>
            {u.title} • {u.sector}
          </option>
        ))}
      </select>

      {err ? <div className="text-red-600">{err}</div> : null}
      {loading ? <div className="text-slate-600 text-sm">Chargement…</div> : null}

      <table className="min-w-full text-sm border">
        <thead>
          <tr>
            <th className="p-3 text-left">Obligation</th>
            <th className="p-3">Status</th>
            <th className="p-3">Priorité</th>
            <th className="p-3">Dernière MAJ</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => {
            const lab = obligationLabel(r);
            return (
              <tr
                key={r.id}
                className="cursor-pointer hover:bg-slate-50"
                onClick={() => setSelectedStateId(r.id)}
              >
                <td className="p-3">
                  <div className="font-semibold">{lab.main}</div>
                  {lab.sub && <div className="text-xs text-slate-500">{lab.sub}</div>}
                </td>
                <td className="p-3">{badge(r.status)}</td>
                <td className="p-3">{r.priority}</td>
                <td className="p-3">{prettyDate(r.updatedAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <ObligationDrawerClient stateId={selectedStateId} onClose={() => setSelectedStateId(null)} />
    </div>
  );
}
