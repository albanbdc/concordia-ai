"use client";

import { useState } from "react";

type Status = "TODO" | "IN_PROGRESS" | "DONE";

type UIAction = {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  audit?: {
    type: string | null;
  } | null;
};

function computeCompliancePercentage(actions: { status: Status }[]) {
  if (actions.length === 0) return 0;

  const scoreSum = actions.reduce((sum, a) => {
    if (a.status === "DONE") return sum + 1;       // Terminé = 100%
    if (a.status === "IN_PROGRESS") return sum + 0.5; // En cours = 50%
    return sum; // TODO = 0
  }, 0);

  return Math.round((scoreSum * 100) / actions.length);
}


function formatStatusLabel(status: Status) {
  if (status === "TODO") return "À faire";
  if (status === "IN_PROGRESS") return "En cours";
  return "Terminé";
}

type Props = {
  initialActions: UIAction[];
};

export default function ComplianceActionsClient({ initialActions }: Props) {
  const [actions, setActions] = useState<UIAction[]>(initialActions);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const percentage = computeCompliancePercentage(actions);

  async function handleStatusChange(id: string, newStatus: Status) {
    const previousStatus =
      actions.find((a) => a.id === id)?.status ?? "TODO";

    setUpdatingId(id);
    // Optimistic update
    setActions((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: newStatus } : a
      )
    );

    try {
      const res = await fetch(`/api/compliance-actions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Erreur API");
      }
    } catch (e) {
      // rollback en cas d'erreur
      setActions((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: previousStatus } : a
        )
      );
      alert(
        "Erreur lors de la mise à jour du statut. Merci de réessayer."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="max-w-4xl mx-auto py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">
          Suivi de mise en conformité
        </h1>
        <p className="text-sm text-muted-foreground">
          Visualisez les actions issues des audits IA et suivez votre
          progression vers un niveau de conformité renforcé vis-à-vis
          de l&apos;AI Act et du RGPD.
        </p>
      </header>

      {/* JAUGE GLOBALE */}
      <section className="border rounded p-6 bg-white shadow-sm space-y-4">
        <h2 className="text-sm font-semibold">
          Jauge globale de conformité
        </h2>

        <div className="flex items-end gap-6">
          <div className="w-12 h-40 bg-gray-200 rounded relative overflow-hidden border">
            <div
              className="absolute bottom-0 left-0 w-full bg-green-500 transition-all"
              style={{ height: `${percentage}%` }}
            />
          </div>

          <div className="space-y-1">
            <p className="text-3xl font-bold">
              {percentage}
              <span className="text-base font-normal text-slate-500 ml-1">
                %
              </span>
            </p>
            {actions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune action de conformité enregistrée pour le moment.
                La jauge évoluera dès que des plans d&apos;action seront
                créés et suivis.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                La jauge reflète la part d&apos;actions marquées comme{" "}
                <span className="font-medium">terminées</span> dans
                votre plan global de mise en conformité.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* LISTE DES ACTIONS */}
      <section className="border rounded p-6 bg-white shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Plan d&apos;action</h2>
          <p className="text-xs text-slate-500">
            {actions.length === 0
              ? "Aucune action pour le moment."
              : `${actions.length} action${
                  actions.length > 1 ? "s" : ""
                } suivie(s).`}
          </p>
        </div>

        {actions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Dès qu&apos;un audit générera un plan d&apos;action
            détaillé, les actions apparaîtront ici et pourront être
            suivies dans le temps.
          </p>
        ) : (
          <div className="divide-y">
            {actions.map((a) => (
              <div
                key={a.id}
                className="py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <p className="font-medium text-sm">
                    {a.title}
                  </p>
                  {a.description && (
                    <p className="text-xs text-slate-600">
                      {a.description}
                    </p>
                  )}
                  {a.audit && (
                    <p className="text-[11px] text-slate-400">
                      Issu de l&apos;audit :{" "}
                      <span className="italic">
                        {a.audit?.type || "Audit IA"}
                      </span>
                    </p>
                  )}
                </div>

                {/* Sélecteur de statut */}
                <div className="flex items-center gap-2">
                  <select
                    className="border rounded px-2 py-1 text-xs"
                    value={a.status}
                    disabled={updatingId === a.id}
                    onChange={(e) =>
                      handleStatusChange(
                        a.id,
                        e.target.value as Status
                      )
                    }
                  >
                    <option value="TODO">À faire</option>
                    <option value="IN_PROGRESS">En cours</option>
                    <option value="DONE">Terminé</option>
                  </select>

                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium ${
                      a.status === "DONE"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : a.status === "IN_PROGRESS"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-slate-50 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {formatStatusLabel(a.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
