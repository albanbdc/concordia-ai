"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

const SECTORS = [
  "Finance", "Assurance", "Santé", "Éducation", "Industrie",
  "Transport", "Énergie", "Retail", "Tech", "Juridique",
  "Secteur public", "Immobilier", "Autre",
];

const SIZES = ["TPE", "PME", "ETI", "Grand groupe"];

export default function RegisterPage() {
  const router = useRouter();

  const [orgName, setOrgName] = useState("");
  const [sector, setSector] = useState("");
  const [size, setSize] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptCGU, setAcceptCGU] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!orgName.trim()) return setError("Le nom de l'organisation est requis.");
    if (!contactName.trim()) return setError("Le nom du référent est requis.");
    if (!email.trim()) return setError("L'email est requis.");
    if (password.length < 8) return setError("Le mot de passe doit contenir au moins 8 caractères.");
    if (password !== passwordConfirm) return setError("Les mots de passe ne correspondent pas.");
    if (!acceptCGU) return setError("Vous devez accepter les Conditions Générales d'Utilisation pour créer un compte.");

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgName, sector, size, contactName, email, phone, password }),
      });

      const data = await res.json();

      if (!data?.ok) {
        if (data.error === "EMAIL_TAKEN") setError("Cet email est déjà utilisé.");
        else setError("Erreur lors de la création du compte.");
        return;
      }

      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        router.push("/login");
        return;
      }

      router.push("/welcome");
    } catch {
      setError("Erreur inattendue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 transition";
  const labelClass = "block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5";

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">

      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z" fill="white" fillOpacity="0.9"/>
          </svg>
        </div>
        <div className="text-2xl font-bold tracking-tight text-white">Concordia</div>
        <div className="mt-1 text-sm text-slate-400">Créez votre espace de conformité AI Act</div>
      </div>

      <div className="w-full max-w-lg space-y-4">

        {/* Organisation */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
          <div className="text-sm font-bold text-white mb-2">Votre organisation</div>

          <div>
            <label className={labelClass}>Nom de l'organisation *</label>
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Ex : Acme SAS"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Secteur d'activité</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className={inputClass + " cursor-pointer"}
            >
              <option value="" className="bg-slate-900">— Sélectionner —</option>
              {SECTORS.map((s) => (
                <option key={s} value={s} className="bg-slate-900">{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Taille</label>
            <div className="flex gap-2 flex-wrap">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={[
                    "rounded-xl border px-4 py-2 text-sm font-semibold transition",
                    size === s
                      ? "border-white bg-white text-slate-900"
                      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10",
                  ].join(" ")}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Référent */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
          <div className="text-sm font-bold text-white mb-2">Référent conformité</div>

          <div>
            <label className={labelClass}>Nom complet *</label>
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Ex : Marie Dupont"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Email *</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="marie.dupont@acme.fr"
              autoComplete="off"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Téléphone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="+33 6 12 34 56 78"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Mot de passe *</label>
            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="8 caractères minimum"
                autoComplete="new-password"
                className={inputClass + " pr-12"}
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
            <label className={labelClass}>Confirmer le mot de passe *</label>
            <input
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="Répétez le mot de passe"
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
        </div>

        {/* Checkbox CGU */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5 flex-shrink-0">
              <input
                type="checkbox"
                checked={acceptCGU}
                onChange={(e) => setAcceptCGU(e.target.checked)}
                className="sr-only"
              />
              <div
                className={[
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                  acceptCGU
                    ? "border-white bg-white"
                    : "border-white/20 bg-white/5 group-hover:border-white/40",
                ].join(" ")}
              >
                {acceptCGU && (
                  <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                    <path d="M1 4L4 7L10 1" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-slate-300 leading-relaxed">
              J'accepte les{" "}
              <Link
                href="/cgu"
                target="_blank"
                className="text-white underline underline-offset-2 hover:text-slate-200 transition"
                onClick={(e) => e.stopPropagation()}
              >
                Conditions Générales d'Utilisation
              </Link>{" "}
              et la{" "}
              <Link
                href="/politique-confidentialite"
                target="_blank"
                className="text-white underline underline-offset-2 hover:text-slate-200 transition"
                onClick={(e) => e.stopPropagation()}
              >
                Politique de Confidentialité
              </Link>{" "}
              de Concordia AI
            </span>
          </label>
        </div>

        {/* Erreur */}
        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 disabled:opacity-50 transition"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Création en cours…
            </span>
          ) : (
            "Créer mon espace Concordia →"
          )}
        </button>

        <div className="text-center">
          <Link href="/login" className="text-xs text-slate-500 hover:text-slate-300 transition">
            Déjà un compte ? Se connecter →
          </Link>
        </div>

        <div className="text-center text-xs text-slate-600">
          Règlement (UE) 2024/1689 · AI Act · Conformité probatoire
        </div>
      </div>
    </div>
  );
}