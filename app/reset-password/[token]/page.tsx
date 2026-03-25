"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!data?.ok) {
        if (data.error === "TOKEN_EXPIRED") setError("Ce lien a expiré. Faites une nouvelle demande.");
        else if (data.error === "TOKEN_USED") setError("Ce lien a déjà été utilisé.");
        else if (data.error === "TOKEN_INVALID") setError("Ce lien est invalide.");
        else if (data.error === "PASSWORD_TOO_SHORT") setError("Le mot de passe doit contenir au moins 8 caractères.");
        else setError("Une erreur est survenue. Veuillez réessayer.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
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

          {success ? (
            <div className="text-center space-y-4">
              <div className="text-3xl">✅</div>
              <div className="text-base font-bold text-white">Mot de passe modifié</div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Votre mot de passe a été réinitialisé. Vous allez être redirigé vers la page de connexion.
              </p>
              <Link
                href="/login"
                className="block mt-4 text-sm text-slate-400 hover:text-white transition"
              >
                → Se connecter maintenant
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-lg font-semibold text-white">Nouveau mot de passe</h1>
                <p className="mt-1 text-sm text-slate-400">
                  Choisissez un nouveau mot de passe pour votre compte.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="8 caractères minimum"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 transition pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition text-xs font-semibold"
                    >
                      {showPassword ? "Cacher" : "Voir"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Confirmer le mot de passe
                  </label>
                  <input
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Répétez le mot de passe"
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
                  {loading ? "Réinitialisation…" : "Réinitialiser mon mot de passe →"}
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

        <div className="mt-6 text-center text-xs text-slate-600">
          Règlement (UE) 2024/1689 · AI Act · Conformité probatoire
        </div>
      </div>
    </div>
  );
}