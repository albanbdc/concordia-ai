"use client";

import Link from "next/link";

const TIMELINE = [
  {
    date: "1er août 2024",
    label: "Entrée en vigueur",
    detail: "Le règlement (UE) 2024/1689 est publié au Journal officiel de l'UE et entre en vigueur.",
    status: "done",
  },
  {
    date: "2 février 2025",
    label: "Pratiques interdites",
    detail: "Art. 5 — Interdiction des systèmes de manipulation, social scoring, identification biométrique en temps réel dans l'espace public.",
    status: "active",
  },
  {
    date: "2 août 2025",
    label: "Modèles GPAI",
    detail: "Art. 51-55 — Obligations pour les modèles d'IA à usage général (documentation, droits d'auteur, transparence des données).",
    status: "active",
  },
  {
    date: "2 août 2026",
    label: "Systèmes à haut risque (Annexe III)",
    detail: "Art. 9-15, 26-29 — Obligations complètes pour les systèmes HIGH RISK : emploi, éducation, services essentiels, justice, infrastructures critiques.",
    status: "upcoming",
  },
  {
    date: "2 août 2027",
    label: "Produits réglementés (Annexe I)",
    detail: "Art. 6(1) — Systèmes IA composants de sécurité de produits soumis à la législation sectorielle (dispositifs médicaux, aviation, véhicules).",
    status: "upcoming",
  },
];

const RISK_LEVELS = [
  {
    level: "Interdit",
    color: "rose",
    ref: "Art. 5 AI Act",
    description: "Pratiques strictement interdites, sans exception possible.",
    examples: [
      "Manipulation subliminale du comportement",
      "Exploitation des vulnérabilités (âge, handicap)",
      "Notation sociale par les autorités publiques",
      "Police prédictive individuelle par profilage",
      "Identification biométrique en temps réel dans l'espace public",
      "Catégorisation biométrique révélant des données sensibles",
      "Reconnaissance des émotions au travail ou en école",
    ],
    action: "Création bloquée dans Concordia.",
  },
  {
    level: "Haut risque",
    color: "amber",
    ref: "Art. 6 + Annexe III AI Act",
    description: "Systèmes ayant un impact significatif sur les droits fondamentaux ou la sécurité. Soumis aux obligations les plus strictes.",
    examples: [
      "Recrutement, évaluation et gestion des salariés",
      "Accès à l'éducation et orientation scolaire",
      "Crédit bancaire, assurance, aide sociale",
      "Aide à la décision judiciaire",
      "Gestion des infrastructures critiques",
      "Forces de l'ordre et gestion des frontières",
      "Composants de sécurité de produits réglementés (Annexe I)",
    ],
    action: "17 obligations générées automatiquement dans Concordia.",
  },
  {
    level: "Transparence limitée",
    color: "blue",
    ref: "Art. 50 AI Act",
    description: "Systèmes interagissant directement avec des personnes ou générant des contenus. Obligations d'information et de marquage.",
    examples: [
      "Chatbots et assistants IA",
      "Systèmes de recommandation personnalisée",
      "Génération de texte, image, audio ou vidéo (deepfakes)",
      "Modèles GPAI (obligations cumulatives Art. 51-55)",
    ],
    action: "5 obligations générées automatiquement dans Concordia.",
  },
  {
    level: "Risque minimal",
    color: "emerald",
    ref: "Art. 53 + Considérant 48 AI Act",
    description: "Systèmes sans impact significatif sur les droits ou la sécurité. Obligations légères de documentation et d'information.",
    examples: [
      "Filtres anti-spam",
      "IA de recommandation de contenu sans profilage sensible",
      "Outils de productivité (génération de code, résumé de texte)",
      "Jeux vidéo avec IA",
    ],
    action: "2 obligations générées automatiquement dans Concordia.",
  },
];

const OBLIGATIONS_BY_ROLE = [
  {
    role: "Déployeur",
    ref: "Art. 26 AI Act",
    description: "Entité qui utilise un système IA dans le cadre de ses activités professionnelles.",
    obligations: [
      { title: "Utilisation conforme aux instructions du fournisseur", ref: "Art. 26(1)" },
      { title: "Désignation d'un responsable de supervision humaine", ref: "Art. 26(2) + Art. 14" },
      { title: "Évaluation d'impact sur les droits fondamentaux (FRIA)", ref: "Art. 26(4) + Art. 27" },
      { title: "Information des personnes concernées par une décision IA", ref: "Art. 26(6)" },
      { title: "Coopération avec les autorités de surveillance", ref: "Art. 26(7)" },
      { title: "Monitoring actif et signalement des incidents graves", ref: "Art. 29 + Art. 73" },
      { title: "Vérification de la conformité du fournisseur (DoC, enregistrement UE)", ref: "Art. 11 + Art. 47 + Art. 49" },
    ],
  },
  {
    role: "Fournisseur",
    ref: "Art. 9-15 + Art. 47-49 AI Act",
    description: "Entité qui développe et met sur le marché un système IA.",
    obligations: [
      { title: "Système de gestion des risques (cycle de vie complet)", ref: "Art. 9" },
      { title: "Gouvernance et qualité des données d'entraînement", ref: "Art. 10" },
      { title: "Documentation technique complète (Annexe IV)", ref: "Art. 11" },
      { title: "Journalisation automatique des événements (logs)", ref: "Art. 12" },
      { title: "Instructions d'utilisation claires pour les déployeurs", ref: "Art. 13" },
      { title: "Conception avec supervision humaine effective", ref: "Art. 14" },
      { title: "Exactitude, robustesse et cybersécurité", ref: "Art. 15" },
      { title: "Déclaration de conformité UE (DoC) et marquage CE", ref: "Art. 47" },
      { title: "Enregistrement dans la base de données UE", ref: "Art. 49" },
      { title: "Surveillance post-commercialisation et signalement", ref: "Art. 72 + Art. 73" },
    ],
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string; badgeText: string }> = {
  rose: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-900",
    badge: "bg-rose-100 border-rose-200",
    badgeText: "text-rose-700",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-900",
    badge: "bg-amber-100 border-amber-200",
    badgeText: "text-amber-700",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-900",
    badge: "bg-blue-100 border-blue-200",
    badgeText: "text-blue-700",
  },
  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-900",
    badge: "bg-emerald-100 border-emerald-200",
    badgeText: "text-emerald-700",
  },
};

export default function IaActPage() {
  return (
    <div className="p-8 space-y-16 max-w-4xl mx-auto">

      {/* HEADER */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
          Règlement (UE) 2024/1689
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Comprendre l'AI Act</h1>
        <p className="mt-3 text-slate-600 max-w-2xl">
          L'AI Act est le premier cadre juridique contraignant au monde sur l'intelligence artificielle.
          Il s'applique à toute organisation utilisant ou développant des systèmes IA sur le marché européen,
          quelle que soit sa localisation géographique.
        </p>
        <div className="mt-4 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
          Source : Journal officiel de l'UE — 12 juillet 2024
        </div>
      </div>

      {/* CALENDRIER */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Calendrier d'application</h2>
          <p className="mt-1 text-sm text-slate-500">
            L'AI Act s'applique progressivement selon la criticité des systèmes concernés.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200" />
          <div className="space-y-6">
            {TIMELINE.map((item, idx) => (
              <div key={idx} className="relative flex items-start gap-4 pl-8">
                <div className={[
                  "absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0",
                  item.status === "done" ? "border-slate-400 bg-slate-100" :
                  item.status === "active" ? "border-emerald-500 bg-emerald-50" :
                  "border-slate-300 bg-white",
                ].join(" ")}>
                  {item.status === "done" && <div className="w-2 h-2 rounded-full bg-slate-400" />}
                  {item.status === "active" && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                  {item.status === "upcoming" && <div className="w-2 h-2 rounded-full bg-slate-300" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-bold text-slate-900">{item.label}</span>
                    <span className={[
                      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                      item.status === "active" ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
                      item.status === "done" ? "border-slate-200 bg-slate-50 text-slate-500" :
                      "border-slate-200 bg-white text-slate-500",
                    ].join(" ")}>
                      {item.status === "active" ? "✓ En vigueur" : item.date}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NIVEAUX DE RISQUE */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Les 4 niveaux de risque</h2>
          <p className="mt-1 text-sm text-slate-500">
            L'AI Act classe les systèmes IA selon leur niveau de risque. Plus le risque est élevé, plus les obligations sont strictes.
          </p>
        </div>

        <div className="space-y-4">
          {RISK_LEVELS.map((r) => {
            const c = colorMap[r.color];
            return (
              <div key={r.level} className={`rounded-2xl border ${c.border} ${c.bg} p-5`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${c.badge} ${c.badgeText}`}>
                      {r.level}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">{r.ref}</span>
                  </div>
                </div>

                <p className={`mt-3 text-sm font-medium ${c.text}`}>{r.description}</p>

                <ul className="mt-3 space-y-1">
                  {r.examples.map((ex, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="mt-0.5 shrink-0 text-slate-400">•</span>
                      {ex}
                    </li>
                  ))}
                </ul>

                <div className={`mt-4 text-xs font-semibold ${c.badgeText}`}>
                  → {r.action}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* OBLIGATIONS PAR RÔLE */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Obligations par rôle</h2>
          <p className="mt-1 text-sm text-slate-500">
            Les obligations diffèrent selon que vous êtes déployeur ou fournisseur du système IA.
            Ces obligations s'appliquent aux systèmes classifiés HIGH RISK.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {OBLIGATIONS_BY_ROLE.map((r) => (
            <div key={r.role} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-slate-900">{r.role}</span>
                <span className="text-xs text-slate-400 font-semibold">{r.ref}</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">{r.description}</p>

              <ul className="space-y-2">
                {r.obligations.map((o, i) => (
                  <li key={i} className="flex items-start justify-between gap-3">
                    <span className="text-xs text-slate-700">{o.title}</span>
                    <span className="shrink-0 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                      {o.ref}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-900">
          Concordia génère automatiquement les obligations applicables à chaque système IA déclaré.
        </p>
        <p className="text-xs text-slate-500">
          Règlement (UE) 2024/1689 du Parlement européen et du Conseil du 13 juin 2024 —
          Journal officiel de l'Union européenne, 12 juillet 2024.
        </p>
        <Link
          href="/dashboard/systems"
          className="inline-block mt-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-black transition"
        >
          Déclarer un système IA →
        </Link>
      </section>

    </div>
  );
}