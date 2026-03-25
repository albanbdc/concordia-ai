"use client";

import { useState } from "react";

export default function InvitationsPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setError(null);
    setInviteUrl(null);
    setLoading(true);

    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() || null }),
      });

      const data = await res.json();

      if (!data?.ok) throw new Error();

      setInviteUrl(data.inviteUrl);
    } catch {
      setError("Erreur lors de la génération du lien.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-8 max-w-xl space-y-8">

      <div>
        <div className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
          Administration
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Générer une invitation</h1>
        <p className="mt-1 text-sm text-slate-500">
          Créez un lien d'inscription unique valable 7 jours à envoyer à un nouveau client.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Email du destinataire (optionnel)
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="client@organisation.fr"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 transition"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            Si renseigné, l'email sera pré-rempli dans le formulaire d'inscription.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-black disabled:opacity-50 transition"
        >
          {loading ? "Génération…" : "Générer le lien d'invitation →"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {inviteUrl && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 space-y-3">
          <div className="text-sm font-bold text-emerald-800">
            ✓ Lien généré — valable 7 jours
          </div>
          <div className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-xs text-slate-700 font-mono break-all">
            {inviteUrl}
          </div>
          <button
            onClick={handleCopy}
            className="w-full rounded-xl border border-emerald-300 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition"
          >
            {copied ? "✓ Copié !" : "Copier le lien"}
          </button>
          <p className="text-xs text-emerald-600">
            Envoyez ce lien par email au destinataire. Il expirera automatiquement après 7 jours ou après utilisation.
          </p>
        </div>
      )}
    </div>
  );
}