"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!data?.ok) throw new Error();

      setSent(true);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">

      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z" fill="white" fillOpacity="0.9"/>
          </svg>
        </div>
        <div className="text-2xl font-bold tracking-tight text-white">Concordia</div>
        <div className="mt-1 text-sm text-slate-400">Registre de conformité AI Act</div>
      </div>

      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8">

          {sent ? (
            <div className="text-center space-y-4">
              <div className="text-3xl">📧</div>
              <div className="text-base font-bold text-white">Email envoyé</div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Si un compte existe avec cette adresse, vous recevrez un lien de réinitialisation dans quelques minutes.
              </p>
              <Link
                href="/login"
                className="block mt-4 text-sm text-slate-400 hover:text-white transition"
              >
                → Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-lg font-semibold text-white">Mot de passe oublié</h1>
                <p className="mt-1 text-sm text-slate-400">
                  Entrez votre email pour recevoir un lien de réinitialisation.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    placeholder="vous@organisation.fr"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 transition"
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 disabled:opacity-50 transition"
                >
                  {loading ? "Envoi…" : "Envoyer le lien →"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/login" className="text-xs text-slate-500 hover:text-slate-300 transition">
                  → Retour à la connexion
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}