"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function WelcomePage() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">

      {/* Logo */}
      <div
        className="transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z" fill="white" fillOpacity="0.9"/>
          </svg>
        </div>
      </div>

      {/* Texte principal */}
      <div
        className="transition-all duration-700 delay-150 space-y-4"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}
      >
        <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Règlement (UE) 2024/1689
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Bienvenue sur Concordia
        </h1>
        <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
          Votre espace de conformité AI Act est prêt. Structurez vos obligations, documentez vos preuves et produisez un registre juridiquement opposable.
        </p>
      </div>

      {/* Séparateur */}
      <div
        className="my-10 w-16 h-px bg-white/10 transition-all duration-700 delay-300"
        style={{ opacity: visible ? 1 : 0 }}
      />

      {/* CTA */}
      <div
        className="transition-all duration-700 delay-300 space-y-4"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}
      >
        <button
          onClick={() => router.push("/dashboard/systems")}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition"
        >
          Commencer →
        </button>
        <div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-xs text-slate-600 hover:text-slate-400 transition"
          >
            Accéder au dashboard
          </button>
        </div>
      </div>

      {/* Footer */}
      <div
        className="absolute bottom-8 text-xs text-slate-700 transition-all duration-700 delay-500"
        style={{ opacity: visible ? 1 : 0 }}
      >
        Concordia · Conformité probatoire AI Act
      </div>

    </div>
  );
}