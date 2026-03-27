"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">

      {/* Logo + nom */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z" fill="white" fillOpacity="0.9"/>
          </svg>
        </div>
        <div className="text-2xl font-bold tracking-tight text-white">Concordia</div>
        <div className="mt-1 text-sm text-slate-400">Registre de conformité AI Act</div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8">

          <div className="mb-6">
            <h1 className="text-lg font-semibold text-white">Connexion</h1>
            <p className="mt-1 text-sm text-slate-400">
              Accédez à votre espace de conformité.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                autoComplete="email"
                placeholder="vous@organisation.fr"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 transition"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
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

            {/* Erreur */}
            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 disabled:opacity-50 transition"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Connexion…
                </span>
              ) : (
                "Se connecter →"
              )}
            </button>

            {/* Mot de passe oublié */}
            <div className="text-center">
              <Link
                href="/forgot-password"
                className="text-xs text-slate-500 hover:text-slate-300 transition"
              >
                Mot de passe oublié ?
              </Link>
            </div>
          </form>
        </div>
       
        <div className="text-center">
  <Link href="/register" className="text-xs text-slate-500 hover:text-slate-300 transition">
    Pas encore de compte ? S'inscrire →
  </Link>
</div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-600">
          Règlement (UE) 2024/1689 · AI Act · Conformité probatoire
        </div>
      </div>
    </div>
  );
}