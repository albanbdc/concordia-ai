"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // ✅ Mode test : on "simule" une connexion
    sessionStorage.setItem("concordia:demoAuth", "1");
    sessionStorage.setItem("concordia:demoEmail", email || "tester@concordia.demo");

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white border rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Connexion</h1>
        <p className="text-slate-600 text-sm mt-1">
          Mode test : pas de création de compte, accès direct au dashboard.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="mt-1 w-full border rounded-lg px-3 py-2"
              placeholder="testeur@exemple.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Mot de passe</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="mt-1 w-full border rounded-lg px-3 py-2"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-3 py-2"
          >
            Se connecter (mode test)
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="w-full border rounded-lg px-3 py-2 font-semibold"
          >
            Continuer sans login
          </button>
        </form>
      </div>
    </div>
  );
}
