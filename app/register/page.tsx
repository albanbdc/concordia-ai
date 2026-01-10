"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOkMsg(null);

    const emailTrim = email.toLowerCase().trim();
    const pw = password.trim();
    const cf = confirm.trim();

    if (!emailTrim || !pw || !cf) {
      setErr("Email et mot de passe requis.");
      return;
    }

    if (pw.length < 8) {
      setErr("Mot de passe trop court (min 8 caractères).");
      return;
    }

    if (pw !== cf) {
      setErr("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailTrim, password: pw }),
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!res.ok || !data?.ok) {
        setErr(data?.error || `Erreur (${res.status})`);
        return;
      }

      setOkMsg("Compte créé. Redirection vers la connexion…");
      setTimeout(() => router.push("/login"), 600);
    } catch (e: any) {
      setErr(e?.message || "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md border bg-white rounded-xl p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Créer un compte</h1>
        <p className="text-sm text-slate-500 mt-1">
          Inscription test Concordia (email + mot de passe)
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600">Email</label>
            <input
              type="email"
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@concordia.ai"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">
              Mot de passe
            </label>
            <input
              type="password"
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 caractères"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Retape le mot de passe"
              required
            />
          </div>

          {err ? (
            <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-md p-2">
              {err}
            </div>
          ) : null}

          {okMsg ? (
            <div className="text-sm text-green-700 border border-green-200 bg-green-50 rounded-md p-2">
              {okMsg}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-md py-2 text-sm font-medium disabled:opacity-60"
          >
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-600">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-blue-700 hover:underline">
            Se connecter
          </Link>
        </div>
      </div>
    </main>
  );
}
