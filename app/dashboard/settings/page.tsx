"use client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [size, setSize] = useState("");
  const [contactName, setContactName] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadOrg() {
    try {
      const res = await fetch("/api/organization");
      const json = await res.json();

      if (res.ok && json?.ok && json?.org) {
        setName(json.org.name || "");
        setSector(json.org.sector || "");
        setSize(json.org.size || "");
        setContactName(json.org.contactName || "");
      }
    } catch {}
  }

  useEffect(() => {
    loadOrg();
  }, []);

  async function saveOrg() {
    setSaving(true);
    try {
      const res = await fetch("/api/organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          sector,
          size,
          contactName,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Erreur");
      }

      alert("Organisation enregistrée");
    } catch (e: any) {
      alert(e?.message || "Erreur serveur");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Organisation</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Nom de l'organisation
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: BNP Paribas"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Secteur
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            placeholder="Ex: Banque"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Taille
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="Ex: 5000 employés"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Contact principal
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Ex: Jean Dupont"
          />
        </div>

        <button
          onClick={saveOrg}
          disabled={saving}
          className="mt-4 bg-black text-white px-4 py-2 rounded-lg"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}