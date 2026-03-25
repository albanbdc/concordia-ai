"use client";

import { useEffect, useState } from "react";

const SIZES = ["TPE", "PME", "ETI", "Grand groupe"];

const SECTORS = [
  "Finance", "Assurance", "Santé", "Éducation", "Industrie",
  "Transport", "Énergie", "Retail", "Tech", "Juridique",
  "Secteur public", "Immobilier", "Autre",
];

type Organization = {
  id: string;
  name: string;
  sector: string | null;
  size: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: string;
};

export default function OrganisationPage() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [size, setSize] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  useEffect(() => {
    fetch("/api/organization")
      .then((r) => r.json())
      .then((data) => {
        if (data?.ok) {
          const o = data.organization;
          setOrg(o);
          setName(o.name ?? "");
          setSector(o.sector ?? "");
          setSize(o.size ?? "");
          setContactName(o.contactName ?? "");
          setContactEmail(o.contactEmail ?? "");
          setContactPhone(o.contactPhone ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/organization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, sector, size, contactName, contactEmail, contactPhone }),
      });

      const data = await res.json();
      if (!data?.ok) throw new Error();

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-sm text-slate-500">Chargement…</div>;
  }

  const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition";
  const labelClass = "block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5";

  return (
    <div className="p-8 max-w-2xl space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mon organisation</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ces informations apparaissent dans les exports PDF et le ledger de conformité.
        </p>
      </div>

      {/* Organisation */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
        <div className="text-sm font-bold text-slate-900 mb-1">Informations générales</div>

        <div>
          <label className={labelClass}>Nom de l'organisation *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex : Acme SAS"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Secteur d'activité</label>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className={inputClass}
          >
            <option value="">— Sélectionner —</option>
            {SECTORS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Taille de l'organisation</label>
          <div className="flex gap-3 flex-wrap">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={[
                  "rounded-xl border px-4 py-2 text-sm font-semibold transition",
                  size === s
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Référent conformité */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
        <div className="text-sm font-bold text-slate-900 mb-1">Référent conformité AI Act</div>

        <div>
          <label className={labelClass}>Nom du référent</label>
          <input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Ex : Marie Dupont"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Email</label>
          <input
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            type="email"
            placeholder="Ex : marie.dupont@acme.fr"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Téléphone</label>
          <input
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            type="tel"
            placeholder="Ex : +33 6 12 34 56 78"
            className={inputClass}
          />
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Save */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-black disabled:opacity-50 transition"
        >
          {saving ? "Sauvegarde…" : "Sauvegarder"}
        </button>

        {saved && (
          <span className="text-sm font-semibold text-emerald-600">
            ✓ Sauvegardé
          </span>
        )}
      </div>

    </div>
  );
}