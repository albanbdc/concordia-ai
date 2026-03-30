import Link from "next/link";
 
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
 
      {/* NAV */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <span className="text-sm font-bold text-white tracking-tight">Concordia</span>
        </div>
 
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-400 hover:text-white transition"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition"
          >
            Commencer →
          </Link>
        </div>
      </nav>
 
      {/* HERO */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
 
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-slate-400 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Règlement (UE) 2024/1689 — AI Act · Échéance 2 août 2026
        </div>
 
        {/* Titre */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight leading-tight max-w-4xl">
          Votre conformité{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            AI Act
          </span>
          ,{" "}
          <br className="hidden sm:block" />
          structurée et opposable.
        </h1>
 
        {/* Sous-titre */}
        <p className="mt-6 text-lg text-slate-400 max-w-xl leading-relaxed">
          Concordia génère automatiquement vos obligations réglementaires, trace chaque action et produit un registre cryptographique opposable en cas de contrôle.
        </p>
 
        {/* CTA */}
        <div className="mt-10 flex items-center gap-4 flex-wrap justify-center">
          <Link
            href="/register"
            className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition shadow-lg"
          >
            Commencer →
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
          >
            Se connecter
          </Link>
        </div>
 
        {/* Social proof */}
        <div className="mt-16 flex items-center gap-8 flex-wrap justify-center">
          {[
            { value: "30", label: "obligations AI Act cataloguées" },
            { value: "SHA-256", label: "chaîne cryptographique" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="mt-1 text-xs text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </main>
 
      {/* FOOTER */}
      <footer className="px-8 py-6 border-t border-white/5 flex items-center justify-between flex-wrap gap-4">
        <div className="text-xs text-slate-600">
          Concordia · Règlement (UE) 2024/1689 · AI Act
        </div>
        <div className="flex items-center gap-6 text-xs text-slate-600">
          <Link href="/politique-confidentialite" className="hover:text-slate-400 transition">Confidentialité</Link>
          <Link href="/mentions-legales" className="hover:text-slate-400 transition">Mentions légales</Link>
          <Link href="/cgu" className="hover:text-slate-400 transition">CGU</Link>
          <Link href="/pricing" className="hover:text-slate-400 transition">Tarifs</Link>
          <Link href="/login" className="hover:text-slate-400 transition">Connexion</Link>
          <Link href="/register" className="hover:text-slate-400 transition">Inscription</Link>
        </div>
      </footer>
 
    </div>
  );
}