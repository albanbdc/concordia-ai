"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type UseCase = {
  id: string;
  key: string;
  title: string;
  sector: string;
  classification: "NORMAL" | "TRANSPARENCY" | "HIGH_RISK";
  isProhibited: boolean;
  role: "DEPLOYER" | "PROVIDER" | "BOTH" | null;
  isGPAI: boolean;
  createdAt: string;
};

type System = {
  id: string;
  name: string;
  provider: string | null;
  version: string | null;
  owner: string;
  status: "NORMAL" | "CONFORMITE_RENFORCEE_REQUISE";
  useCases: UseCase[];
};

function getClassificationBadge(uc: UseCase) {
  if (uc.isProhibited) {
    return {
      label: "INTERDIT (Article 5)",
      bg: "#fee2e2",
      color: "#991b1b",
      border: "1px solid #dc2626",
    };
  }

  switch (uc.classification) {
    case "HIGH_RISK":
      return {
        label: "HIGH RISK (Annexe III)",
        bg: "#ffedd5",
        color: "#9a3412",
        border: "1px solid #f97316",
      };
    case "TRANSPARENCY":
      return {
        label: "Transparence requise (Art. 50)",
        bg: "#e0f2fe",
        color: "#075985",
        border: "1px solid #0ea5e9",
      };
    default:
      return {
        label: "Régime normal",
        bg: "#dcfce7",
        color: "#166534",
        border: "1px solid #22c55e",
      };
  }
}

function getRoleBadge(role: UseCase["role"]) {
  switch (role) {
    case "PROVIDER":
      return { label: "Fournisseur", bg: "#f3e8ff", color: "#6b21a8", border: "1px solid #a855f7" };
    case "BOTH":
      return { label: "Déployeur + Fournisseur", bg: "#fef9c3", color: "#854d0e", border: "1px solid #eab308" };
    default:
      return { label: "Déployeur", bg: "#f0fdf4", color: "#166534", border: "1px solid #86efac" };
  }
}

const tagStyle = {
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: 8,
  fontSize: 11,
  fontWeight: 700,
};

export default function SystemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const systemId = params?.id as string;

  const [system, setSystem] = useState<System | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!systemId) return;

    fetch(`/api/systems/${systemId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok) {
          setSystem(data.system);
        } else {
          router.push("/dashboard/systems");
        }
      })
      .finally(() => setLoading(false));
  }, [systemId, router]);

  if (loading) {
    return <div style={{ padding: 40 }}>Chargement...</div>;
  }

  if (!system) {
    return null;
  }

  return (
    <div style={{ maxWidth: 1000, margin: "60px auto", padding: 20 }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>
          {system.name}
        </h1>

        <div style={{ color: "#6b7280", marginBottom: 10 }}>
          Responsable : {system.owner}
        </div>

        <div style={{ fontWeight: 600 }}>
          {system.status === "CONFORMITE_RENFORCEE_REQUISE"
            ? "⚠️ Conformité renforcée requise"
            : "✅ Statut normal"}
        </div>
      </div>

      {/* Infos système */}
      <div
        style={{
          padding: 24,
          borderRadius: 16,
          border: "1px solid #e5e7eb",
          marginBottom: 40,
          background: "white",
        }}
      >
        <div style={{ marginBottom: 8 }}>
          <strong>Fournisseur :</strong> {system.provider || "—"}
        </div>
        <div>
          <strong>Version :</strong> {system.version || "—"}
        </div>
      </div>

      {/* Use cases */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
          Cas d'usage
        </h2>

        <Link
          href={`/dashboard/systems/${system.id}/usecases/new`}
          style={{
            display: "inline-block",
            marginBottom: 20,
            padding: "10px 16px",
            borderRadius: 10,
            background: "#111827",
            color: "white",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          + Ajouter un cas d'usage
        </Link>

        {system.useCases.length === 0 ? (
          <div
            style={{
              padding: 24,
              borderRadius: 16,
              border: "1px solid #e5e7eb",
              background: "#f9fafb",
            }}
          >
            Aucun cas d'usage pour ce système.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {system.useCases.map((uc) => {
              const classifBadge = getClassificationBadge(uc);
              const roleBadge = getRoleBadge(uc.role);

              return (
                <Link
                  key={uc.id}
                  href={`/dashboard/usecases/${uc.key}`}
                  style={{
                    padding: 20,
                    borderRadius: 14,
                    border: uc.isProhibited
                      ? "2px solid #dc2626"
                      : "1px solid #e5e7eb",
                    textDecoration: "none",
                    color: "inherit",
                    background: "white",
                    display: "block",
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 16 }}>
                    {uc.title}
                  </div>

                  <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 12 }}>
                    Secteur : {uc.sector}
                  </div>

                  {/* Badges */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>

                    {/* Classification */}
                    <span style={{
                      ...tagStyle,
                      background: classifBadge.bg,
                      color: classifBadge.color,
                      border: classifBadge.border,
                    }}>
                      {classifBadge.label}
                    </span>

                    {/* Rôle */}
                    <span style={{
                      ...tagStyle,
                      background: roleBadge.bg,
                      color: roleBadge.color,
                      border: roleBadge.border,
                    }}>
                      {roleBadge.label}
                    </span>

                    {/* GPAI */}
                    {uc.isGPAI && (
                      <span style={{
                        ...tagStyle,
                        background: "#ede9fe",
                        color: "#4c1d95",
                        border: "1px solid #7c3aed",
                      }}>
                        GPAI (Art. 51-55)
                      </span>
                    )}

                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}