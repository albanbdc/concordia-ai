import Link from "next/link";

const PLANS = [
  {
    name: "Basic",
    price: "149",
    target: "Startups & PME",
    engagement: "Sans engagement",
    highlight: false,
    usecases: "Jusqu'à 3 cas d'usage",
    features: [
      "Mapping des cas d'usage IA",
      "Qualification automatique du risque AI Act",
      "Moteur d'obligations AI Act",
      "Gestion des preuves",
      "Ledger SHA-256 horodaté",
      "Support email (48h)",
    ],
    notIncluded: [
      "Horodatage eIDAS",
      "Rapports d'audit",
      "Multi-utilisateurs",
    ],
    cta: "Commencer →",
    ctaHref: "/register",
  },
  {
    name: "Premium",
    price: "349",
    target: "ETI & Scale-ups",
    engagement: "Sans engagement",
    highlight: true,
    usecases: "Jusqu'à 15 cas d'usage",
    features: [
      "Toutes les fonctionnalités Basic",
      "Horodatage eIDAS des preuves",
      "Rapports d'audit personnalisables",
      "Support prioritaire (24h)",
    ],
    notIncluded: [
      "Multi-utilisateurs",
    ],
    cta: "Commencer →",
    ctaHref: "/register",
  },
  {
    name: "Corporate",
    price: "899",
    target: "Grands Groupes",
    engagement: "Sans engagement",
    highlight: false,
    usecases: "Cas d'usage illimités",
    features: [
      "Toutes les fonctionnalités Premium",
      "Cas d'usage IA illimités",
      "Multi-utilisateurs illimités",
      "Support dédié + Account Manager",
    ],
    notIncluded: [],
    cta: "Commencer →",
    ctaHref: "/register",
  },
  {
    name: "Partner",
    price: "1 499",
    target: "Cabinets Conseil & Avocats",
    engagement: "Sans engagement",
    highlight: false,
    usecases: "Illimités par client",
    priceLabel: "À partir de",
    features: [
      "Toutes les fonctionnalités Corporate",
      "Gestion multi-clients / entités",
      "Console partenaire centralisée",
      "Support dédié + Onboarding",
    ],
    notIncluded: [],
    cta: "Nous contacter →",
    ctaHref: "mailto:albantwd@gmail.com",
  },
];

const COMPARISON = [
  { feature: "Cas d'usage IA", basic: "3", premium: "15", corporate: "Illimités", partner: "Illimités" },
  { feature: "Mapping & qualification risques", basic: "✅", premium: "✅", corporate: "✅", partner: "✅" },
  { feature: "Moteur obligations AI Act", basic: "✅", premium: "✅", corporate: "✅", partner: "✅" },
  { feature: "Gestion des preuves", basic: "✅", premium: "✅", corporate: "✅", partner: "✅" },
  { feature: "Ledger SHA-256", basic: "✅", premium: "✅", corporate: "✅", partner: "✅" },
  { feature: "Horodatage eIDAS", basic: "—", premium: "✅", corporate: "✅", partner: "✅" },
  { feature: "Rapports d'audit", basic: "—", premium: "✅", corporate: "✅", partner: "✅" },
  { feature: "Multi-utilisateurs", basic: "—", premium: "—", corporate: "Illimités", partner: "Illimités" },
  { feature: "Gestion multi-clients", basic: "—", premium: "—", corporate: "—", partner: "✅" },
  { feature: "Console partenaire", basic: "—", premium: "—", corporate: "—", partner: "✅" },
  { feature: "Support", basic: "Email 48h", premium: "Prioritaire 24h", corporate: "Dédié", partner: "Dédié + Onboarding" },
  { feature: "Mises à jour réglementaires", basic: "✅", premium: "✅", corporate: "✅", partner: "✅" },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">

      {/* NAV */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <span className="text-sm font-bold text-white tracking-tight">Concordia</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition">
            Se connecter
          </Link>
          <Link href="/register" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition">
            Commencer →
          </Link>
        </div>
      </nav>

      <main className="flex-1 px-6 py-20">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-slate-400 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Sans engagement · Résiliation à tout moment
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Des tarifs adaptés à<br className="hidden sm:block" /> chaque organisation
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
            Choisissez le plan qui correspond à la taille et aux besoins de votre organisation. Toutes les mises à jour réglementaires sont incluses.
          </p>
        </div>

        {/* Plans */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-24">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={[
                "relative rounded-2xl border p-6 flex flex-col",
                plan.highlight
                  ? "border-white/30 bg-white/10"
                  : "border-white/10 bg-white/5",
              ].join(" ")}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-900">
                    Populaire
                  </div>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  {plan.name}
                </div>
                <div className="text-xs text-slate-500 mb-4">{plan.target}</div>

                <div className="flex items-end gap-1 mb-1">
                  {plan.priceLabel && (
                    <span className="text-xs text-slate-500 mb-1">À partir de</span>
                  )}
                  <span className="text-3xl font-bold text-white">{plan.price} €</span>
                  <span className="text-slate-500 text-sm mb-1">/mois</span>
                </div>
                <div className="text-xs text-slate-600">{plan.engagement}</div>
              </div>

              {/* Use cases badge */}
              <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 mb-6">
                {plan.usecases}
              </div>

              {/* Features */}
              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="mt-0.5 text-emerald-500 flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
                {plan.notIncluded.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="mt-0.5 flex-shrink-0">—</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.ctaHref}
                className={[
                  "w-full rounded-xl px-4 py-3 text-sm font-semibold text-center transition",
                  plan.highlight
                    ? "bg-white text-slate-900 hover:bg-slate-100"
                    : "border border-white/20 bg-white/5 text-white hover:bg-white/10",
                ].join(" ")}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Tableau comparatif */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-xl font-bold text-white text-center mb-8">
            Comparaison détaillée
          </h2>

          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/3">
                    Fonctionnalité
                  </th>
                  {["Basic", "Premium", "Corporate", "Partner"].map((p) => (
                    <th key={p} className="px-4 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={[
                      "border-b border-white/5",
                      i % 2 === 0 ? "bg-white/0" : "bg-white/[0.02]",
                    ].join(" ")}
                  >
                    <td className="px-5 py-3.5 text-xs text-slate-400">{row.feature}</td>
                    {[row.basic, row.premium, row.corporate, row.partner].map((val, j) => (
                      <td key={j} className="px-4 py-3.5 text-center text-xs">
                        <span className={
                          val === "✅" ? "text-emerald-500" :
                          val === "—" ? "text-slate-700" :
                          "text-slate-300"
                        }>
                          {val}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ / Garanties */}
        <div className="max-w-2xl mx-auto text-center mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: "🔒", title: "Sans engagement", desc: "Résiliez à tout moment, sans frais ni justification." },
              { icon: "⚖️", title: "Mises à jour incluses", desc: "Toutes les évolutions réglementaires AI Act sont intégrées automatiquement." },
              { icon: "🇪🇺", title: "Données en Europe", desc: "Vos données sont hébergées sur des serveurs européens (OVH Cloud)." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
                <div className="text-2xl mb-3">{item.icon}</div>
                <div className="text-sm font-bold text-white mb-1">{item.title}</div>
                <div className="text-xs text-slate-400 leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA final */}
        <div className="text-center">
          <p className="text-slate-400 text-sm mb-6">
            Une question sur nos offres ?{" "}
            <a href="mailto:albantwd@gmail.com" className="text-white underline underline-offset-2 hover:text-slate-200 transition">
              Contactez-nous
            </a>
          </p>
          <Link
            href="/register"
            className="inline-flex rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition shadow-lg"
          >
            Commencer maintenant →
          </Link>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="px-8 py-6 border-t border-white/5 flex items-center justify-between flex-wrap gap-4 mt-12">
        <div className="text-xs text-slate-600">
          Concordia · Règlement (UE) 2024/1689 · AI Act
        </div>
        <div className="flex items-center gap-6 text-xs text-slate-600">
          <Link href="/politique-confidentialite" className="hover:text-slate-400 transition">Confidentialité</Link>
          <Link href="/mentions-legales" className="hover:text-slate-400 transition">Mentions légales</Link>
          <Link href="/cgu" className="hover:text-slate-400 transition">CGU</Link>
          <Link href="/login" className="hover:text-slate-400 transition">Connexion</Link>
        </div>
      </footer>

    </div>
  );
}