"use client";

import { useState } from "react";
import { OBLIGATIONS_CATALOG } from "@/lib/obligations-catalog";

const DOCS_SUGGESTIONS: Record<string, string[]> = {
  "OBL-NORMAL-001": [
    "Fiche descriptive du système IA (nom, fournisseur, version, objectif)",
    "Document listant les données d'entrée et de sortie",
    "Note sur les limites connues du système",
  ],
  "OBL-NORMAL-002": [
    "Mention d'information IA dans les CGU ou conditions d'utilisation",
    "Bandeau ou notice d'information visible par l'utilisateur",
  ],
  "OBL-TRANSP-001": [
    "Message d'accueil indiquant explicitement l'interaction avec une IA",
    "Politique de transparence publiée sur le site",
  ],
  "OBL-TRANSP-002": [
    "Procédure de marquage des contenus générés par IA",
    "Documentation technique du système de watermarking",
  ],
  "OBL-TRANSP-003": [
    "Notice d'information sur l'utilisation du profilage",
    "Option de désactivation du profilage documentée",
  ],
  "OBL-HR-DEP-001": [
    "Contrat ou accord avec le fournisseur incluant les instructions d'utilisation",
    "Procédure interne d'utilisation conforme du système IA",
    "Registre des usages documentés",
  ],
  "OBL-HR-DEP-002": [
    "Lettre de mission ou fiche de poste du responsable de supervision",
    "Procédure d'intervention et d'arrêt d'urgence du système",
    "Formation documentée du responsable",
  ],
  "OBL-HR-DEP-003": [
    "Rapport FRIA (Fundamental Rights Impact Assessment)",
    "Registre des risques identifiés et mesures d'atténuation",
    "Validation par le DPO ou le juriste",
  ],
  "OBL-HR-DEP-004": [
    "Template de notification aux personnes concernées",
    "Preuve d'envoi des notifications (logs, emails)",
  ],
  "OBL-HR-DEP-005": [
    "Procédure de coopération avec les autorités",
    "Registre des demandes d'autorités et réponses apportées",
  ],
  "OBL-HR-DEP-006": [
    "Plan de monitoring actif du système",
    "Procédure de signalement des incidents graves",
    "Registre des incidents et actions correctives",
  ],
  "OBL-HR-DEP-007": [
    "Documentation technique reçue du fournisseur (Annexe IV)",
    "Déclaration de conformité UE (DoC) du fournisseur",
    "Preuve d'enregistrement dans la base de données UE",
  ],
  "OBL-HR-PROV-001": [
    "Document de gestion des risques couvrant tout le cycle de vie",
    "Registre des risques identifiés, évalués et traités",
    "Plan de mise à jour du système de gestion des risques",
  ],
  "OBL-HR-PROV-002": [
    "Politique de gouvernance des données",
    "Rapport d'audit des données d'entraînement",
    "Documentation de la provenance et représentativité des données",
  ],
  "OBL-HR-PROV-003": [
    "Documentation technique complète (Annexe IV AI Act)",
    "Architecture du système et description des composants",
    "Métriques de performance et résultats de tests",
  ],
  "OBL-HR-PROV-004": [
    "Spécifications techniques du système de journalisation",
    "Exemples de logs générés par le système",
    "Procédure de conservation et d'accès aux logs",
  ],
  "OBL-HR-PROV-005": [
    "Manuel d'utilisation destiné aux déployeurs",
    "Notice technique avec conditions d'utilisation et limites",
  ],
  "OBL-HR-PROV-006": [
    "Spécifications techniques des mécanismes de supervision humaine",
    "Procédure d'arrêt et de correction du système",
    "Tests de validation des mécanismes de supervision",
  ],
  "OBL-HR-PROV-007": [
    "Rapport de tests d'exactitude et de robustesse",
    "Politique de cybersécurité appliquée au système IA",
    "Plan de tests adversariaux et résultats",
  ],
  "OBL-HR-PROV-008": [
    "Déclaration de conformité UE signée (Annexe V)",
    "Dossier de marquage CE",
  ],
  "OBL-HR-PROV-009": [
    "Confirmation d'enregistrement dans la base de données UE",
    "Numéro d'enregistrement et informations soumises",
  ],
  "OBL-HR-PROV-010": [
    "Plan de surveillance post-commercialisation",
    "Rapport de surveillance périodique",
    "Procédure de signalement des incidents graves à l'autorité nationale",
  ],
  "OBL-BIO-001": [
    "Analyse juridique démontrant l'absence d'identification biométrique temps réel",
    "Autorisation judiciaire ou administrative si exception applicable",
    "Registre des déploiements biométriques avec justifications légales",
  ],
  "OBL-BIO-002": [
    "Analyse d'impact FRIA spécifique à la catégorisation biométrique",
    "Procédure de supervision humaine renforcée",
    "Documentation démontrant l'absence de traitement de données sensibles",
  ],
  "OBL-BIO-003": [
    "Analyse justifiant l'usage médical ou de sécurité du système",
    "Rapport FRIA dédié à la reconnaissance des émotions",
    "Preuve d'information préalable des personnes concernées",
  ],
  "OBL-GPAI-001": [
    "Documentation technique du modèle GPAI (Annexe XI AI Act)",
    "Description de l'architecture, des données et des méthodes d'entraînement",
    "Rapport de performance et de limitations du modèle",
  ],
  "OBL-GPAI-002": [
    "Politique de respect des droits d'auteur publiée",
    "Registre des sources de données et statut des droits",
    "Procédure de gestion des opt-out des titulaires de droits",
  ],
  "OBL-GPAI-003": [
    "Résumé des données d'entraînement selon le modèle de l'Office de l'IA",
    "Publication accessible publiquement du résumé",
  ],
  "OBL-GPAI-004": [
    "Rapport d'évaluation des risques systémiques",
    "Résultats des tests adversariaux",
    "Plan de cybersécurité spécifique aux risques systémiques",
    "Procédure de signalement à la Commission européenne",
  ],
  "OBL-GPAI-005": [
    "Package d'information transmis aux fournisseurs en aval",
    "Contrat ou accord documentant la transmission d'informations",
    "Documentation des capacités, limitations et conditions d'utilisation",
  ],
};

const CLASSIFICATION_LABELS: Record<string, string> = {
  NORMAL: "Risque minimal",
  TRANSPARENCY: "Transparence",
  HIGH_RISK: "Haut risque",
  BIOMETRIE: "Biométrie",
  GPAI: "GPAI",
};

const CLASSIFICATION_COLORS: Record<string, string> = {
  NORMAL: "border-emerald-200 bg-emerald-50 text-emerald-700",
  TRANSPARENCY: "border-blue-200 bg-blue-50 text-blue-700",
  HIGH_RISK: "border-amber-200 bg-amber-50 text-amber-700",
  BIOMETRIE: "border-rose-200 bg-rose-50 text-rose-700",
  GPAI: "border-violet-200 bg-violet-50 text-violet-700",
};

function getClassification(id: string): string {
  if (id.startsWith("OBL-NORMAL")) return "NORMAL";
  if (id.startsWith("OBL-TRANSP")) return "TRANSPARENCY";
  if (id.startsWith("OBL-HR")) return "HIGH_RISK";
  if (id.startsWith("OBL-BIO")) return "BIOMETRIE";
  if (id.startsWith("OBL-GPAI")) return "GPAI";
  return "NORMAL";
}

const FILTERS = ["Tous", "Risque minimal", "Transparence", "Haut risque", "Biométrie", "GPAI"];

export default function BibliothequePage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Tous");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = OBLIGATIONS_CATALOG.filter((o) => {
    const classification = CLASSIFICATION_LABELS[getClassification(o.id)];
    if (filter !== "Tous" && classification !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        o.title.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        o.legalRef.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">

      {/* Header */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
          Règlement (UE) 2024/1689
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Bibliothèque des obligations</h1>
        <p className="mt-1 text-sm text-slate-500">
          Les 30 obligations officielles de l'AI Act avec les documents recommandés pour y répondre.
        </p>
      </div>

      {/* Filtres + recherche */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une obligation…"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 w-64"
        />
        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                filter === f
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
              ].join(" ")}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Compteur */}
      <div className="text-xs text-slate-400">{filtered.length} obligation{filtered.length > 1 ? "s" : ""}</div>

      {/* Liste */}
      <div className="space-y-3">
        {filtered.map((o) => {
          const classification = getClassification(o.id);
          const colorClass = CLASSIFICATION_COLORS[classification];
          const isOpen = openId === o.id;
          const docs = DOCS_SUGGESTIONS[o.id] ?? [];

          return (
            <div
              key={o.id}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
            >
              <button
                onClick={() => setOpenId(isOpen ? null : o.id)}
                className="w-full text-left px-5 py-4 hover:bg-slate-50 transition flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${colorClass}`}>
                      {CLASSIFICATION_LABELS[classification]}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">{o.legalRef}</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">{o.title}</div>
                </div>
                <span className="text-slate-400 shrink-0 mt-0.5">{isOpen ? "▲" : "▼"}</span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 space-y-4 border-t border-slate-100">

                  {/* Description */}
                  <div className="pt-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Description
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{o.description}</p>
                  </div>

                  {/* Documents suggérés */}
                  {docs.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        Documents recommandés
                      </div>
                      <ul className="space-y-2">
                        {docs.map((doc, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                            <span className="shrink-0 mt-0.5 text-slate-400">📄</span>
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}