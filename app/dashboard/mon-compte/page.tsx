"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

type UserData = {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  organization: {
    id: string;
    name: string;
    sector: string | null;
    size: string | null;
    contactPhone: string | null;
  } | null;
};

export default function MonComptePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Infos perso
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);
  const [savedInfo, setSavedInfo] = useState(false);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  // Mot de passe
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [savedPwd, setSavedPwd] = useState(false);
  const [errorPwd, setErrorPwd] = useState<string | null>(null);

  // Résiliation
  const [showResiliation, setShowResiliation] = useState(false);

  useEffect(() => {
    fetch("/api/user")
      .then((r) => r.json())
      .then((data) => {
        if (data?.ok) {
          setUser(data.user);
          setName(data.user.name ?? "");
          setEmail(data.user.email ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveInfo() {
    setSavingInfo(true);
    setErrorInfo(null);
    setSavedInfo(false);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!data?.ok) {
        if (data.error === "EMAIL_TAKEN") setErrorInfo("Cet email est déjà utilisé.");
        else setErrorInfo("Erreur lors de la sauvegarde.");
        return;
      }
      setSavedInfo(true);
      setTimeout(() => setSavedInfo(false), 3000);
    } catch {
      setErrorInfo("Erreur inattendue.");
    } finally {
      setSavingInfo(false);
    }
  }

  async function handleSavePassword() {
    setErrorPwd(null);
    setSavedPwd(false);
    if (newPassword.length < 8) return setErrorPwd("Le mot de passe doit contenir au moins 8 caractères.");
    if (newPassword !== confirmPassword) return setErrorPwd("Les mots de passe ne correspondent pas.");

    setSavingPwd(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!data?.ok) {
        if (data.error === "WRONG_PASSWORD") setErrorPwd("Mot de passe actuel incorrect.");
        else if (data.error === "PASSWORD_TOO_SHORT") setErrorPwd("Le nouveau mot de passe est trop court.");
        else setErrorPwd("Erreur lors du changement de mot de passe.");
        return;
      }
      setSavedPwd(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSavedPwd(false), 3000);
    } catch {
      setErrorPwd("Erreur inattendue.");
    } finally {
      setSavingPwd(false);
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
        <h1 className="text-2xl font-bold text-slate-900">Mon compte</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gérez vos informations personnelles et votre abonnement.
        </p>
      </div>

      {/* Infos personnelles */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
        <div className="text-sm font-bold text-slate-900">Informations personnelles</div>

        <div>
          <label className={labelClass}>Nom complet</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex : Marie Dupont"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Adresse email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="marie.dupont@acme.fr"
            className={inputClass}
          />
        </div>

        {errorInfo && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorInfo}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            onClick={handleSaveInfo}
            disabled={savingInfo || !email.trim()}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:opacity-50 transition"
          >
            {savingInfo ? "Sauvegarde…" : "Sauvegarder"}
          </button>
          {savedInfo && <span className="text-sm font-semibold text-emerald-600">✓ Sauvegardé</span>}
        </div>
      </div>

      {/* Mot de passe */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
        <div className="text-sm font-bold text-slate-900">Mot de passe</div>

        <div>
          <label className={labelClass}>Mot de passe actuel</label>
          <div className="relative">
            <input
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              type={showPasswords ? "text" : "password"}
              placeholder="••••••••"
              className={inputClass + " pr-16"}
            />
            <button
              type="button"
              onClick={() => setShowPasswords((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition text-xs font-semibold"
            >
              {showPasswords ? "Cacher" : "Voir"}
            </button>
          </div>
        </div>

        <div>
          <label className={labelClass}>Nouveau mot de passe</label>
          <input
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            type={showPasswords ? "text" : "password"}
            placeholder="8 caractères minimum"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Confirmer le nouveau mot de passe</label>
          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type={showPasswords ? "text" : "password"}
            placeholder="Répétez le mot de passe"
            className={inputClass}
          />
        </div>

        {errorPwd && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorPwd}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            onClick={handleSavePassword}
            disabled={savingPwd || !currentPassword || !newPassword || !confirmPassword}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:opacity-50 transition"
          >
            {savingPwd ? "Modification…" : "Modifier le mot de passe"}
          </button>
          {savedPwd && <span className="text-sm font-semibold text-emerald-600">✓ Mot de passe modifié</span>}
        </div>
      </div>

      {/* Organisation */}
      {user?.organization && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-bold text-slate-900">Organisation</div>
            <Link
              href="/dashboard/organisation"
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
            >
              Modifier →
            </Link>
          </div>
          <div className="space-y-2">
            <InfoRow label="Nom" value={user.organization.name} />
            {user.organization.sector && <InfoRow label="Secteur" value={user.organization.sector} />}
            {user.organization.size && <InfoRow label="Taille" value={user.organization.size} />}
            {user.organization.contactPhone && <InfoRow label="Téléphone" value={user.organization.contactPhone} />}
          </div>
        </div>
      )}

      {/* Abonnement */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="text-sm font-bold text-slate-900 mb-4">Abonnement & paiement</div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          La gestion de l'abonnement et des informations de paiement sera disponible prochainement via Stripe.
        </div>
      </div>

      {/* Résiliation */}
      <div className="rounded-2xl border border-rose-100 bg-white p-6">
        <div className="text-sm font-bold text-slate-900 mb-1">Zone de danger</div>
        <p className="text-sm text-slate-500 mb-4">
          La résiliation de votre abonnement entraîne la suppression de toutes vos données.
        </p>

        {!showResiliation ? (
          <button
            onClick={() => setShowResiliation(true)}
            className="rounded-xl border border-rose-200 px-5 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition"
          >
            Résilier mon abonnement
          </button>
        ) : (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 space-y-3">
            <p className="text-sm font-semibold text-rose-700">
              Êtes-vous sûr de vouloir résilier votre abonnement ?
            </p>
            <p className="text-xs text-rose-500">
              Cette action est irréversible. Pour confirmer votre résiliation, contactez-nous à{" "}
              <a href="mailto:albantwd@gmail.com" className="underline underline-offset-2">
                albantwd@gmail.com
              </a>.
            </p>
            <button
              onClick={() => setShowResiliation(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition"
            >
              Annuler
            </button>
          </div>
        )}
      </div>

      {/* Compte créé le */}
      {user?.createdAt && (
        <p className="text-xs text-slate-400">
          Compte créé le{" "}
          {new Date(user.createdAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      )}

    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="text-slate-400 w-24 flex-shrink-0">{label}</span>
      <span className="text-slate-700">{value}</span>
    </div>
  );
}