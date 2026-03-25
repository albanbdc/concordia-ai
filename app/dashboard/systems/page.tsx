// app/dashboard/systems/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type System = {
  id: string;
  name: string;
  provider: string | null;
  version: string | null;
  owner: string;
  status: "NORMAL" | "CONFORMITE_RENFORCEE_REQUISE";
  createdAt: string;
};

export default function SystemsPage() {
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/systems")
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok) {
          setSystems(data.systems);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 1000, margin: "60px auto", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>
          Mes systèmes IA
        </h1>

        <Link
          href="/dashboard/systems/new"
          style={{
            padding: "12px 20px",
            borderRadius: 12,
            background: "#111827",
            color: "white",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          + Ajouter un système
        </Link>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : systems.length === 0 ? (
        <div
          style={{
            padding: 40,
            borderRadius: 16,
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            textAlign: "center",
          }}
        >
          <p style={{ marginBottom: 10, fontWeight: 600 }}>
            Aucun système enregistré
          </p>
          <p style={{ color: "#6b7280" }}>
            Commencez par ajouter votre premier système IA.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 20 }}>
          {systems.map((system) => (
            <Link
              key={system.id}
              href={`/dashboard/systems/${system.id}`}
              style={{
                padding: 24,
                borderRadius: 16,
                border: "1px solid #e5e7eb",
                background: "white",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
                {system.name}
              </div>

              <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>
                Responsable : {system.owner}
              </div>

              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {system.status === "CONFORMITE_RENFORCEE_REQUISE"
                  ? "⚠️ Conformité renforcée requise"
                  : "Statut normal"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}