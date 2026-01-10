"use client";

import Link from "next/link";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";

type DemoCase = {
  id: string;
  title: string;
  sector: string;
  useCase: string;
  department: string;
  auditType: string;
  shortPitch: string;
  impact: string;
};

const DEMO_CASES: DemoCase[] = [
  {
    id: "finance-credit-scoring",
    title: "Banque - Scoring credit IA",
    sector: "Finance - Banque de detail",
    useCase: "Scoring client / credit",
    department: "Risques / Credit",
    auditType: "Cadre legal (AI Act)",
    shortPitch:
      "Evaluer la conformite et les risques d'un modele de scoring credit IA qui accepte ou refuse des demandes de pret.",
    impact:
      "Cas parfait pour montrer l'AI Act (systeme a haut risque), la gouvernance, la transparence et les droits des clients.",
  },
  {
    id: "finance-fraud-detection",
    title: "Banque - Detection de fraude cartes",
    sector: "Finance - Banque de detail",
    useCase: "Detection fraude",
    department: "Securite / Risques",
    auditType: "Analyse des risques",
    shortPitch:
      "Audit d'un moteur de detection de fraude temps reel sur les transactions cartes bancaires.",
    impact:
      "Permet de parler de faux positifs, de supervision humaine, de biais et d'impact client.",
  },
  {
    id: "sante-imagerie",
    title: "Sante - Analyse d'imagerie medicale",
    sector: "Sante - Hopital",
    useCase: "Analyse d'imagerie medicale",
    department: "Medical / Clinique",
    auditType: "Conformite globale",
    shortPitch:
      "Assistant IA qui propose des suspicions de lesions tumorales sur des scanners thoraciques.",
    impact:
      "Cas tres fort pour illustrer la criticite clinique, la validation medicale et les risques de sur-confiance.",
  },
  {
    id: "sante-triage-urgences",
    title: "Sante - Triage IA aux urgences",
    sector: "Sante - Hopital",
    useCase: "Automatisation decisionnelle",
    department: "Urgences",
    auditType: "Analyse des risques",
    shortPitch:
      "Outil qui aide a prioriser les patients a l'accueil des urgences en fonction de leurs symptomes.",
    impact:
      "Parfait pour parler de responsabilite, de supervision et d'equite d'acces aux soins.",
  },
  {
    id: "rh-screening-cv",
    title: "RH - Screening IA des CV",
    sector: "Recrutement / RH",
    useCase: "Recrutement / tri CV",
    department: "RH / Talent Acquisition",
    auditType: "Protection des donnees (RGPD)",
    shortPitch:
      "Systeme qui classe automatiquement les candidats en fonction de leur CV et de leur profil LinkedIn.",
    impact:
      "Met en avant les biais, la transparence envers les candidats et la conformite RGPD.",
  },
  {
    id: "rh-evaluation-performance",
    title: "RH - Evaluation de la performance",
    sector: "Recrutement / RH",
    useCase: "Automatisation decisionnelle",
    department: "RH / Direction",
    auditType: "Cadre legal (AI Act)",
    shortPitch:
      "Score IA utilise pour proposer des augmentations ou promotions en fonction de donnees internes.",
    impact:
      "Ideal pour parler d'equite, de contestation des decisions et d'explicabilite.",
  },
  {
    id: "retail-reco-produits",
    title: "Retail - Recommandation de produits",
    sector: "Commerce - E-commerce",
    useCase: "Recommandation produits",
    department: "Marketing / E-commerce",
    auditType: "Conformite globale",
    shortPitch:
      "Moteur de recommandation personnalisee sur un site e-commerce a fort trafic.",
    impact:
      "Permet d'aborder l'optimisation business vs risques de manipulation et de discrimination indirecte.",
  },
  {
    id: "retail-chatbot-client",
    title: "Retail - Chatbot service client",
    sector: "Commerce - Retail (magasins)",
    useCase: "Chatbot support client",
    department: "Service client",
    auditType: "Analyse des risques",
    shortPitch:
      "Chatbot qui repond aux clients sur les retours produits, garanties et reclamations.",
    impact:
      "Montre les risques de reponses erronees, de desinformation et de gestion des escalades humaines.",
  },
  {
    id: "public-logement-social",
    title: "Secteur public - Attribution logement social",
    sector: "Secteur public - Administration",
    useCase: "Automatisation decisionnelle",
    department: "Affaires sociales / Logement",
    auditType: "Cadre legal (AI Act)",
    shortPitch:
      "Algorithme qui priorise les demandes de logement social en fonction de criteres socio-economiques.",
    impact:
      "Cas ultra-sensible sur la non-discrimination, la transparence et les voies de recours.",
  },
];

type DemoAnalysis = {
  score: string;
  verdict: string;
  riskLevel: string;
  aiActCategory: string;
  execBullets: string[];
  topStrengths: string[];
  topRedFlags: string[];
  detailedStrengths: string;
  detailedRedFlags: string;
  actionPlan: {
    immediate: string[];
    shortTerm: string[];
    midTerm: string[];
  };
};

function getDemoAnalysis(_demo: DemoCase): DemoAnalysis {
  return {
    score: "82 / 100",
    verdict: "Conforme sous conditions",
    riskLevel: "Risque global : modere a eleve",
    aiActCategory: "Systeme d'IA a haut risque (AI Act)",
    execBullets: [
      "Le systeme presente une base de gouvernance et de supervision deja en place, mais encore peu formalisee.",
      "Les principaux risques concernent la documentation, la tracabilite et la transparence vis-a-vis des utilisateurs.",
      "Le niveau de conformite actuel permet une exploitation operationnelle, sous reserve de lancer un plan de mise a niveau priorise.",
      "L'organisation affiche une volonte claire de se mettre en conformite AI Act / RGPD, ce qui est un levier fort de reussite.",
    ],
    topStrengths: [
      "Un proprietaire metier identifie et implique dans le fonctionnement du systeme.",
      "Une supervision humaine reelle sur les decisions a impact fort.",
      "Un suivi de performance deja en place, meme s'il reste partiel.",
    ],
    topRedFlags: [
      "Documentation incomplete des donnees d'entrainement et des jeux de test.",
      "Absence de registre formalise des systemes d'IA dans l'organisation.",
      "Information des utilisateurs / clients partielle ou inexistante.",
    ],
    detailedStrengths:
      "- Gouvernance : un sponsor metier et un proprietaire de systeme sont identifies, ce qui facilite les decisions.\n" +
      "- Supervision : les decisions critiques ne sont pas entierement automatisees ; une revue humaine existe.\n" +
      "- Suivi : des indicateurs de performance (taux d'erreur, volume de cas escalades, etc.) sont deja suivis.\n" +
      "- Engagement : la direction a exprime explicitement son intention d'aligner ce systeme sur l'AI Act.",
    detailedRedFlags:
      "- Tracabilite : la documentation des donnees d'entrainement/test est lacunaire, rendant difficile l'explication des resultats.\n" +
      "- Transparence : les utilisateurs finaux ne sont pas clairement informes de l'usage de l'IA.\n" +
      "- Gouvernance : aucun registre centralise des systemes d'IA n'est tenu a jour.\n" +
      "- Analyse d'impact : l'evaluation des risques fondamentaux (biais, discrimination, impact sur les droits) n'est pas formalisee.\n" +
      "- Processus de mise a jour : les regles de mise a jour du modele et de rollback ne sont pas documentees.",
    actionPlan: {
      immediate: [
        "Formaliser un proprietaire metier et un proprietaire technique dans un registre dedie.",
        "Demarrer une analyse d'impact IA + RGPD sur ce cas d'usage (risques, biais, droits fondamentaux).",
      ],
      shortTerm: [
        "Documenter les sources de donnees, les jeux d'entrainement/test et les metriques de performance cles.",
        "Mettre en place une procedure de supervision humaine clairement definie (qui peut overrider l'IA, quand et comment).",
      ],
      midTerm: [
        "Structurer un registre complet des systemes d'IA de l'organisation, incluant ce systeme.",
        "Deployer un plan de transparence utilisateurs (notice d'information, FAQ, points de contact pour recours).",
      ],
    },
  };
}

// Couleurs style corporate
const COLOR_MARINE = { r: 15, g: 23, b: 42 };
const COLOR_TEAL = { r: 56, g: 189, b: 248 };
const COLOR_YELLOW = { r: 234, g: 179, b: 8 };
const COLOR_MUTED = { r: 100, g: 116, b: 139 };

function setFill(doc: jsPDF, c: { r: number; g: number; b: number }) {
  doc.setFillColor(c.r, c.g, c.b);
}
function setText(doc: jsPDF, c: { r: number; g: number; b: number }) {
  doc.setTextColor(c.r, c.g, c.b);
}
function setDraw(doc: jsPDF, c: { r: number; g: number; b: number }) {
  doc.setDrawColor(c.r, c.g, c.b);
}

function exportDemoPdf(demo: DemoCase) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const now = new Date();
  const dateStr = now.toLocaleString("fr-FR");
  const analysis = getDemoAnalysis(demo);

  // =============== PAGE 1 – COUVERTURE ===============
  setFill(doc, COLOR_MARINE);
  doc.rect(0, 0, 210, 22, "F");

  setText(doc, { r: 255, g: 255, b: 255 });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("CONCORDIA - AI Governance", 15, 14);

  setFill(doc, COLOR_TEAL);
  doc.rect(0, 285, 210, 5, "F");

  setText(doc, COLOR_MARINE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Audit de conformite IA - Rapport de demonstration", 20, 40);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(demo.title, 20, 48);

  // Bloc contexte
  setFill(doc, { r: 248, g: 250, b: 252 });
  setDraw(doc, { r: 226, g: 232, b: 240 });
  doc.rect(20, 60, 115, 55, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setText(doc, COLOR_MARINE);
  doc.text("Contexte du systeme IA", 24, 67);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setText(doc, COLOR_MARINE);

  const contextLines: string[] = [
    `Secteur : ${demo.sector}`,
    `Usage IA : ${demo.useCase}`,
    `Departement : ${demo.department}`,
    `Type d'audit : ${demo.auditType}`,
    `Date du rapport : ${dateStr}`,
  ];

  let yContext = 74;
  contextLines.forEach((line: string) => {
    doc.text(line, 24, yContext);
    yContext += 5;
  });

  // Bloc score / AI Act
  setFill(doc, { r: 248, g: 250, b: 252 });
  setDraw(doc, { r: 226, g: 232, b: 240 });
  doc.rect(140, 60, 50, 55, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  setText(doc, COLOR_MARINE);
  doc.text("Score global", 145, 68);

  setDraw(doc, COLOR_TEAL);
  doc.setLineWidth(0.6);
  doc.circle(165, 82, 12);

  setText(doc, COLOR_MARINE);
  doc.setFontSize(11);
  doc.text(analysis.score, 165, 83, { align: "center" });

  setFill(doc, COLOR_MARINE);
  setText(doc, { r: 255, g: 255, b: 255 });
  doc.setFontSize(8);
  doc.roundedRect(145, 96, 40, 7, 2, 2, "F");
  doc.text("Haut risque (AI Act)", 165, 101, { align: "center" });

  setFill(doc, COLOR_YELLOW);
  setText(doc, COLOR_MARINE);
  doc.roundedRect(145, 107, 40, 7, 2, 2, "F");
  doc.text(analysis.verdict, 165, 112, { align: "center" });

  // Rappel du cas pratique + risque principal + note
  const rappelTop = 132;

  setFill(doc, { r: 248, g: 250, b: 252 });
  setDraw(doc, { r: 226, g: 232, b: 240 });
  doc.rect(20, rappelTop, 170, 36, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setText(doc, COLOR_MARINE);
  doc.text("Rappel du cas pratique", 24, rappelTop + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const pitchLines = doc.splitTextToSize(demo.shortPitch, 160);
  let yPitch = rappelTop + 12;
  pitchLines.forEach((line: string) => {
    doc.text(line, 24, yPitch);
    yPitch += 4;
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Risque principal", 24, yPitch + 3);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const mainRisk: string =
    analysis.topRedFlags[0] ||
    "Ce systeme presente un risque majeur lie a la transparence et a la supervision humaine.";

  const mainRiskLines = doc.splitTextToSize(mainRisk, 160);
  let yRisk = yPitch + 9;
  mainRiskLines.forEach((line: string) => {
    doc.text(line, 24, yRisk);
    yRisk += 4;
  });

  const noteY = Math.max(yRisk + 8, rappelTop + 40);
  setText(doc, COLOR_MUTED);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text(
    "Ce rapport est un exemple de demonstration genere par Concordia sur la base d'un scenario type.",
    20,
    noteY
  );

  // =============== PAGE 2 – SYNTHESE ===============
  doc.addPage();
  let y = 30;

  setText(doc, COLOR_MARINE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("1. Synthese executive", 20, y);
  y += 10;

  doc.setFontSize(11);
  doc.text("1.1 Resume executive", 20, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  analysis.execBullets.forEach((bullet: string) => {
    const lines = doc.splitTextToSize("- " + bullet, 170);
    lines.forEach((line: string) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += 4;
    });
    y += 2;
  });

  y += 4;

  if (y > 220) {
    doc.addPage();
    y = 30;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("1.2 Score et classification", 20, y);
  y += 6;

  setFill(doc, { r: 248, g: 250, b: 252 });
  setDraw(doc, { r: 226, g: 232, b: 240 });
  doc.rect(20, y, 170, 32, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setText(doc, COLOR_MARINE);
  doc.text("Score global", 24, y + 8);
  doc.setFontSize(12);
  doc.text(analysis.score, 24, y + 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const riskText = analysis.riskLevel;
  const riskLines = doc.splitTextToSize(riskText, 80);
  let yRiskBox = y + 8;
  riskLines.forEach((line: string) => {
    doc.text(line, 60, yRiskBox);
    yRiskBox += 4;
  });

  setFill(doc, COLOR_MARINE);
  setText(doc, { r: 255, g: 255, b: 255 });
  doc.setFontSize(8);
  doc.roundedRect(140, y + 6, 46, 7, 2, 2, "F");
  doc.text("Categorie : haut risque", 163, y + 11, { align: "center" });

  setFill(doc, COLOR_YELLOW);
  setText(doc, COLOR_MARINE);
  doc.roundedRect(140, y + 16, 46, 7, 2, 2, "F");
  doc.text("Conforme sous conditions", 163, y + 21, { align: "center" });

  y += 40;

  if (y > 220) {
    doc.addPage();
    y = 30;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("1.3 Top forces", 20, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  analysis.topStrengths.forEach((item: string) => {
    const lines = doc.splitTextToSize("- " + item, 170);
    lines.forEach((line: string) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += 4;
    });
    y += 2;
  });

  y += 4;

  if (y > 230) {
    doc.addPage();
    y = 30;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("1.4 Top red flags", 20, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  analysis.topRedFlags.forEach((item: string) => {
    const lines = doc.splitTextToSize("- " + item, 170);
    lines.forEach((line: string) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += 4;
    });
    y += 2;
  });

  // =============== PAGE 3 – ANALYSE DETAILLEE ===============
  doc.addPage();
  y = 30;

  setText(doc, COLOR_MARINE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("2. Analyse detaillee", 20, y);
  y += 10;

  doc.setFontSize(11);
  doc.text("2.1 Analyse du score", 20, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const scoreExplain =
    "Le score global de 82/100 refleche un systeme deja relativement structure, mais avec des zones de risque non negligeables. " +
    "La priorite est de transformer une intention de conformite en plan d'action concret, documente et suivi.";
  const scoreExplainLines = doc.splitTextToSize(scoreExplain, 170);
  scoreExplainLines.forEach((line: string) => {
    doc.text(line, 20, y);
    y += 4;
  });

  y += 6;

  if (y > 260) {
    doc.addPage();
    y = 30;
  }

  setDraw(doc, { r: 229, g: 231, b: 235 });
  doc.setLineWidth(3);
  doc.line(20, y, 190, y);

  const scoreNumeric = 82;
  const xFilled = 20 + ((190 - 20) * scoreNumeric) / 100;

  setDraw(doc, COLOR_TEAL);
  doc.line(20, y, xFilled, y);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  setText(doc, COLOR_MUTED);
  doc.text("0", 20, y + 5);
  doc.text("100", 188, y + 5);
  doc.text("82/100", xFilled, y - 3, { align: "center" });

  y += 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  setText(doc, COLOR_MARINE);
  doc.text("2.2 Classification AI Act", 20, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const classifText =
    analysis.aiActCategory +
    ". Ce cas d'usage implique des decisions a impact significatif sur les individus. " +
    "Il est donc soumis a des exigences renforcees en termes de gestion des risques, de documentation et de supervision humaine.";
  const classifLines = doc.splitTextToSize(classifText, 170);
  classifLines.forEach((line: string) => {
    doc.text(line, 20, y);
    y += 4;
  });

  y += 6;

  if (y > 230) {
    doc.addPage();
    y = 30;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("2.3 Forces du systeme", 20, y);
  y += 4;

  setFill(doc, { r: 240, g: 253, b: 244 });
  setDraw(doc, { r: 187, g: 247, b: 208 });
  doc.rect(20, y, 170, 35, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setText(doc, COLOR_MARINE);

  const strengthsLines = doc.splitTextToSize(analysis.detailedStrengths, 162);
  let yStr = y + 7;
  strengthsLines.forEach((line: string) => {
    if (yStr > y + 30) return;
    doc.text(line, 24, yStr);
    yStr += 4;
  });

  y += 42;

  if (y > 230) {
    doc.addPage();
    y = 30;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("2.4 Risques et points de vigilance", 20, y);
  y += 4;

  setFill(doc, { r: 254, g: 242, b: 242 });
  setDraw(doc, { r: 254, g: 202, b: 202 });
  doc.rect(20, y, 170, 40, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setText(doc, COLOR_MARINE);

  const redDetailLines = doc.splitTextToSize(analysis.detailedRedFlags, 162);
  let yRed = y + 7;
  redDetailLines.forEach((line: string) => {
    if (yRed > y + 35) return;
    doc.text(line, 24, yRed);
    yRed += 4;
  });

  y += 48;

  if (y > 220) {
    doc.addPage();
    y = 30;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("2.5 Plan d'action priorise", 20, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const renderList = (title: string, items: string[]) => {
    doc.setFont("helvetica", "bold");
    doc.text(title, 22, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    items.forEach((item: string) => {
      const lines = doc.splitTextToSize("- " + item, 166);

      lines.forEach((line: string) => {
        if (y > 270) {
          doc.addPage();
          y = 25;
        }
        doc.text(line, 24, y);
        y += 4;
      });

      y += 2;
    });

    y += 3;
  };

  renderList("Priorite 1 - immediat (0-3 mois)", analysis.actionPlan.immediate);
  renderList("Priorite 2 - court terme (3-9 mois)", analysis.actionPlan.shortTerm);
  renderList("Priorite 3 - moyen terme (9-18 mois)", analysis.actionPlan.midTerm);

  // =============== PAGE 4 – STRUCTURE =================
  doc.addPage();
  y = 30;

  setText(doc, COLOR_MARINE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("3. Structure d'un rapport complet Concordia", 20, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const intro =
    "Dans un projet client reel, Concordia produit un rapport complet, structure en plusieurs modules d'analyse. " +
    "Voici un exemple de structure de rapport pour un systeme d'IA a haut risque :";
  const introLines = doc.splitTextToSize(intro, 170);
  introLines.forEach((line: string) => {
    doc.text(line, 20, y);
    y += 4;
  });

  y += 6;

  const structureBlocks: { title: string; desc: string }[] = [
    {
      title: "3.1 Gouvernance et responsabilites",
      desc:
        "Clarification des roles (proprietaire metier, sponsor, data owner, equipe IA), processus de decision et validation, comites de suivi et frequence des revues.",
    },
    {
      title: "3.2 Donnees et data management",
      desc:
        "Origine des donnees, base legale, qualite et completude, documentation des jeux d'entrainement/test, gestion du cycle de vie des donnees.",
    },
    {
      title: "3.3 Performance et robustesse",
      desc:
        "Metriques de performance, suivi dans le temps, tests de robustesse, comportement en cas de degradation ou de derive.",
    },
    {
      title: "3.4 Biais et equite",
      desc:
        "Analyse des biais selon les segments (sexe, age, localisation...), strategies d'attenuation, monitoring continu des ecarts de traitement.",
    },
    {
      title: "3.5 Explicabilite et transparence",
      desc:
        "Niveau d'explicabilite interne (pour les equipes) et externe (utilisateurs finaux), documentation pedagogique, messages de transparence.",
    },
    {
      title: "3.6 Securite et resilience",
      desc:
        "Protection contre les attaques (injection, data poisoning), gestion des incidents, plans de rollback et procedures de desactivation rapide.",
    },
    {
      title: "3.7 Conformite RGPD et AI Act",
      desc:
        "Analyse de conformite aux exigences RGPD (information, droits, minimisation) et aux exigences AI Act (classification, gestion des risques, documentation).",
    },
  ];

  structureBlocks.forEach((block) => {
    if (y > 260) {
      doc.addPage();
      y = 25;
    }

    setFill(doc, COLOR_TEAL);
    doc.rect(20, y - 1, 2, 10, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    setText(doc, COLOR_MARINE);
    doc.text(block.title, 24, y + 3);

    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const descLines = doc.splitTextToSize(block.desc, 170);
    descLines.forEach((line: string) => {
      if (y > 270) {
        doc.addPage();
        y = 25;
      }
      doc.text(line, 24, y);
      y += 4;
    });
    y += 4;
  });

  y += 4;
  if (y > 275) {
    doc.addPage();
    y = 260;
  }

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  setText(doc, COLOR_MUTED);
  doc.text(
    "Ce document est un exemple de rapport de demonstration. Un projet reel donne lieu a une analyse adaptee a votre contexte.",
    20,
    y
  );

  const anyDoc: any = doc;
  const pageCount = anyDoc.getNumberOfPages
    ? anyDoc.getNumberOfPages()
    : 1;

  for (let i = 1; i <= pageCount; i++) {
    anyDoc.setPage(i);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    setText(doc, COLOR_MUTED);
    doc.text(
      `Concordia - Audit de conformite IA (demo) - Page ${i} / ${pageCount}`,
      20,
      290
    );
  }

  doc.save(`demo-concordia-${demo.id}.pdf`);
}
export default function DemoPage() {
  return (
    <main className="max-w-5xl mx-auto py-10 space-y-8">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold">Centre de demo Concordia</h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Utilise ces cas preconfigures pour demontrer Concordia en situation
          reelle : chaque scenario represente un cas d&apos;usage typique
          (banque, sante, RH, retail, secteur public) que tu peux lancer en
          quelques secondes pendant un rendez-vous client.
        </p>
        <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs text-slate-600 bg-slate-50">
          Mode demo : soit tu pre-remplis l&apos;audit pour le lancer en direct,
          soit tu ouvres un exemple de rapport PDF riche pour montrer le
          livrable.
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {DEMO_CASES.map((demo) => (
          <article
            key={demo.id}
            className="border rounded-lg bg-white p-4 flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <h2 className="text-sm font-semibold">{demo.title}</h2>
              <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="px-2 py-1 rounded-full bg-slate-100">
                  {demo.sector}
                </span>
                <span className="px-2 py-1 rounded-full bg-slate-100">
                  {demo.useCase}
                </span>
                <span className="px-2 py-1 rounded-full bg-slate-100">
                  {demo.department}
                </span>
                <span className="px-2 py-1 rounded-full bg-slate-100">
                  Audit : {demo.auditType}
                </span>
              </div>
              <p className="text-xs text-slate-700">{demo.shortPitch}</p>
              <p className="text-xs text-slate-500 italic">{demo.impact}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t mt-2 gap-2">
              <div className="flex flex-col gap-1 text-[11px] text-slate-500 max-w-[55%]">
                <span>
                  Astuce 1 : presente le contexte en 20 secondes, puis bascule
                  sur l&apos;onglet &quot;Audit IA&quot; pour lancer l&apos;analyse
                  en direct.
                </span>
                <span>
                  Astuce 2 : montre en parallele un exemple de rapport PDF riche
                  pour projeter le livrable final.
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  href={`/dashboard/audit?demo=${encodeURIComponent(demo.id)}`}
                >
                  <Button variant="outline" size="sm">
                    Pre-remplir l&apos;audit
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => exportDemoPdf(demo)}
                >
                  Voir un exemple PDF
                </Button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

