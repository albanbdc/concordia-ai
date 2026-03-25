// /app/dashboard/registre-vivant/RegistreVivantClient.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";

/* ======================
   TYPES
====================== */

type ComplianceRow = {
  stateId: string;
  status: string;
  priority: string;
  owner: string | null;
  dueDate: string | null;
  updatedAt: string;
  hasProof: boolean;
  useCase: {
    id: string;
    key: string;
    title: string;
    sector: string;
  };
  obligation: {
    id: string;
    title: string;
    legalRef: string | null;
    category: string | null;
    criticality: string | null;
  };
};

type TimelinePoint = {
  auditId: string;
  createdAt: string;
  score?: number;
};

/* ======================
   COLORS
====================== */

const PIE_COLORS: Record<string, string> = {
  COMPLIANT: "#16a34a",
  IN_PROGRESS: "#f59e0b",
  NON_COMPLIANT: "#dc2626",
};

const CRIT_COLORS: Record<string, string> = {
  CRITICAL: "#dc2626",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#16a34a",
};

/* ======================
   SMALL UI
====================== */

function Pill({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
      <span
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-slate-600">{label}</span>
      <span className="text-slate-900">{value}</span>
    </div>
  );
}

function StatTile({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

/* ======================
   PIE (premium)
====================== */

function CompliancePie({
  compliant,
  inProgress,
  nonCompliant,
  pct,
}: {
  compliant: number;
  inProgress: number;
  nonCompliant: number;
  pct: number;
}) {
  const data = [
    { name: "Conforme", value: compliant, key: "COMPLIANT" },
    { name: "En cours", value: inProgress, key: "IN_PROGRESS" },
    { name: "Non conforme", value: nonCompliant, key: "NON_COMPLIANT" },
  ].filter((d) => d.value > 0);

  return (
    <div className="relative w-full">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">
            Conformité globale
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Synthèse instantanée (état actuel)
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Pill label="Conforme" value={compliant} color={PIE_COLORS.COMPLIANT} />
          <Pill
            label="En cours"
            value={inProgress}
            color={PIE_COLORS.IN_PROGRESS}
          />
          <Pill
            label="Non conforme"
            value={nonCompliant}
            color={PIE_COLORS.NON_COMPLIANT}
          />
        </div>
      </div>

      <div className="relative h-[320px]">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={84}
              outerRadius={132}
              paddingAngle={3}
              stroke="transparent"
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={PIE_COLORS[entry.key]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-xs font-semibold text-slate-500">
            Niveau actuel
          </div>
          <div className="mt-1 text-[56px] leading-none font-bold text-slate-900">
            {pct}%
          </div>
          <div className="mt-2 text-xs text-slate-500">
            (plus c’est haut, mieux c’est)
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================
   TIMELINE (premium)
====================== */

function ComplianceTimeline({ data }: { data: TimelinePoint[] }) {
  const formatted = data
    .filter((p) => typeof p.score === "number")
    .map((p) => ({
      date: new Date(p.createdAt).toLocaleDateString(),
      score: p.score,
    }));

  if (formatted.length === 0) {
    return (
      <div className="text-sm text-slate-500">
        Pas encore assez d’audits pour afficher une évolution.
      </div>
    );
  }

  const showEvery = Math.max(1, Math.ceil(formatted.length / 6));

  return (
    <div className="w-full">
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-900">
          Évolution de la conformité
        </div>
        <div className="mt-1 text-xs text-slate-500">
          Basé sur l’historique des audits
        </div>
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer>
          <LineChart data={formatted} margin={{ left: 8, right: 8, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickMargin={8}
              interval={0}
              tickFormatter={(_, index) =>
                index % showEvery === 0 ? formatted[index]?.date : ""
              }
            />
            <YAxis domain={[0, 100]} tickMargin={8} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#0f172a"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ======================
   CRITICALITY (premium)
====================== */

function CriticalityChart({ rows }: { rows: ComplianceRow[] }) {
  const counts = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };

  rows.forEach((r) => {
    const c = (r.obligation.criticality || "").toUpperCase();
    if (counts.hasOwnProperty(c)) {
      counts[c as keyof typeof counts]++;
    }
  });

  const data = ["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((name) => ({
    name,
    value: counts[name as keyof typeof counts],
  }));

  return (
    <div className="w-full">
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-900">
          Répartition par criticité
        </div>
        <div className="mt-1 text-xs text-slate-500">
          Lecture du risque (sans dramatiser)
        </div>
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ left: 8, right: 8, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tickMargin={8} />
            <YAxis tickMargin={8} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" radius={[10, 10, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={CRIT_COLORS[entry.name]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ======================
   COMPONENT
====================== */

export default function RegistreVivantClient() {
  const [rows, setRows] = useState<ComplianceRow[]>([]);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/compliance/obligations");
      const json = await res.json();
      setRows(json.rows || []);

      const tlRes = await fetch("/api/compliance/timeline");
      const tlJson = await tlRes.json();
      setTimeline(tlJson.points || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const dash = useMemo(() => {
    const totalObligations = rows.length;

    const useCaseKeys = new Set<string>();
    let compliant = 0;
    let inProgress = 0;
    let nonCompliant = 0;

    for (const r of rows) {
      useCaseKeys.add(r.useCase.key);

      if (r.status === "COMPLIANT") compliant++;
      else if (r.status === "IN_PROGRESS") inProgress++;
      else if (r.status === "NON_COMPLIANT") nonCompliant++;
    }

    const pct =
      totalObligations > 0 ? Math.round((compliant / totalObligations) * 100) : 0;

    return {
      totalUseCases: useCaseKeys.size,
      totalObligations,
      compliant,
      inProgress,
      nonCompliant,
      pct,
    };
  }, [rows]);

  if (loading) return <div className="p-8">Chargement…</div>;

  return (
    <div className="p-8 space-y-10">
      <div className="flex items-end justify-between gap-4 flex-wrap">
  <div>
    <h1 className="text-2xl font-bold">Pilotage — registre vivant</h1>
    <p className="text-sm text-slate-600">Vision exécutive immédiate.</p>
  </div>

  <div className="flex items-center gap-3">
    <a
      href="/api/export/pdf"
      target="_blank"
      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
    >
      Télécharger le dossier PDF
    </a>

    <Link
      href="/dashboard/usecases"
      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
    >
      Voir les cas d’usage
    </Link>

    <Link
      href="/dashboard/registre-vivant/liste"
      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
    >
      Voir la liste complète
    </Link>
  </div>
</div>

      {/* BANDEAU STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatTile label="Cas d’usage" value={dash.totalUseCases} />
        <StatTile label="Obligations" value={dash.totalObligations} />
      </div>

      {/* Ligne 1 — côte à côte */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <CompliancePie
            compliant={dash.compliant}
            inProgress={dash.inProgress}
            nonCompliant={dash.nonCompliant}
            pct={dash.pct}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <ComplianceTimeline data={timeline} />
        </div>
      </div>

      {/* Ligne 2 — pleine largeur */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <CriticalityChart rows={rows} />
      </div>
    </div>
  );
}