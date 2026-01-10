"use client";

import React from "react";
import GenerateActionButton from "@/components/concordia/GenerateActionButton";

/* =========================
   Types
========================= */

export type ComplianceAction = {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
};

interface Props {
  audit: any;
  auditId: string;
  actions?: ComplianceAction[];
}

/* =========================
   Helpers UI
========================= */

function ComplianceBadge({ level }: { level?: string }) {
  if (!level) return null;

  const map: Record<string, string> = {
    unlikely: "bg-red-600 text-white",
    uncertain: "bg-yellow-500 text-black",
    likely: "bg-green-600 text-white",
  };

  const label: Record<string, string> = {
    unlikely: "Peu probable",
    uncertain: "Incertain",
    likely: "Probable",
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${map[level]}`}>
      {label[level] ?? level}
    </span>
  );
}

/* =========================
   Component
========================= */

export default function ConcordiaReport({
  audit,
  auditId,
  actions = [],
}: Props) {
  if (!audit) {
    return <div className="text-sm text-slate-500">Aucun audit fourni.</div>;
  }

  const {
    systemName,
    systemStatus,
    score,
    statusReason,
    useCases = [],
  } = audit;

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6">
      {/* HEADER */}
      <section className="space-y-2">
        <h1 className="text-2xl font-bold">Rapport Concordia</h1>
        <p className="text-slate-600 text-sm">
          Analyse complète du système :{" "}
          <span className="font-semibold">{systemName}</span>
        </p>
      </section>

      {/* STATUT + SCORE */}
      <section className="border rounded-lg p-4 bg-white shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-slate-500">
              Statut réglementaire (IA Act)
            </p>
            <span className="px-3 py-1 rounded-md text-sm font-semibold bg-red-600 text-white">
              {systemStatus}
            </span>
          </div>

          <div className="text-right">
            <p className="text-xs uppercase text-slate-500">Score global</p>
            <p className="text-3xl font-bold">
              {score?.overall ?? 0}/100
            </p>
          </div>
        </div>

        {statusReason && (
          <p className="text-sm text-slate-700 border-t pt-3">
            {statusReason}
          </p>
        )}
      </section>

      {/* USE CASES */}
      {Array.isArray(useCases) &&
        useCases.map((uc: any) => (
          <section
            key={uc.useCaseId}
            className="border rounded-lg p-4 bg-white shadow-sm space-y-3"
          >
            <h2 className="text-lg font-semibold">{uc.useCaseName}</h2>

            <ul className="space-y-2 text-sm">
              {Array.isArray(uc.appliedObligations) &&
                uc.appliedObligations.map((o: any) => (
                  <li
                    key={o.obligationId}
                    className="border p-2 rounded bg-slate-50"
                  >
                    <div className="flex justify-between items-center">
                      <span>{o.label}</span>
                      <ComplianceBadge level={o.estimatedCompliance} />
                    </div>
                  </li>
                ))}
            </ul>
          </section>
        ))}

      {/* PLAN D’ACTIONS */}
      <section className="border rounded-lg p-4 bg-white shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            Plan d’actions de conformité
          </h2>

          <GenerateActionButton auditId={auditId} />
        </div>

        {actions.length === 0 ? (
          <p className="text-sm text-slate-500">
            Aucun plan d’action généré pour cet audit.
          </p>
        ) : (
          <ul className="space-y-3">
            {actions.map((a) => (
              <li
                key={a.id}
                className="border rounded p-3 bg-slate-50"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{a.title}</span>
                  <span className="text-xs font-bold">{a.priority}</span>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  {a.description}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
