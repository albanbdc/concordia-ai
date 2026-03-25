// app/dashboard/systems/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewSystemPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [provider, setProvider] = useState("");
  const [version, setVersion] = useState("");
  const [owner, setOwner] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim() || !owner.trim()) {
      alert("Nom du système et responsable requis.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/systems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          provider,
          version,
          owner,
        }),
      });

      const data = await res.json();

      if (!data?.ok) throw new Error();

      router.push("/dashboard/systems");
    } catch {
      alert("Erreur lors de la création.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: "60px auto", padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 40 }}>
        Ajouter un système IA
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <input
          placeholder="Nom du système *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: 14,
            borderRadius: 12,
            border: "1px solid #d1d5db",
          }}
        />

        <input
          placeholder="Fournisseur"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          style={{
            padding: 14,
            borderRadius: 12,
            border: "1px solid #d1d5db",
          }}
        />

        <input
          placeholder="Version"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          style={{
            padding: 14,
            borderRadius: 12,
            border: "1px solid #d1d5db",
          }}
        />

        <input
          placeholder="Responsable principal *"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          style={{
            padding: 14,
            borderRadius: 12,
            border: "1px solid #d1d5db",
          }}
        />

        <button
          onClick={handleCreate}
          disabled={loading}
          style={{
            padding: "14px 24px",
            borderRadius: 12,
            background: "#111827",
            color: "white",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading ? "Création..." : "Créer le système"}
        </button>
      </div>
    </div>
  );
}