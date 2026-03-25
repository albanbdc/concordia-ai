// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {

  // =========================
  // 🏢 ORGANIZATION + USER
  // =========================

  const org = await prisma.organization.upsert({
    where: { id: "concordia-test-org" },
    update: {},
    create: {
      id: "concordia-test-org",
      name: "Concordia Test Org",
      sector: "Tech",
      size: "1-10",
      contactName: "Alban",
    },
  });

  const passwordHash = await bcrypt.hash("test1234", 10);

  await prisma.user.upsert({
    where: { email: "test@concordia.ai" },
    update: {
      organizationId: org.id,
    },
    create: {
      email: "test@concordia.ai",
      passwordHash,
      name: "Alban",
      organizationId: org.id,
    },
  });

  console.log("✅ Organization + User créés");

  // =========================
  // 📚 OBLIGATIONS CATALOG
  // =========================

  const items = [
    {
      id: "rs-1",
      title: "Gestion des risques (plan + mesures)",
      description: "Identifier, analyser et réduire les risques liés au système IA.",
      legalRef: "EU AI Act (risk management)",
      category: "risk",
      criticality: "CRITICAL",
    },
    {
      id: "rs-2",
      title: "Qualité et gouvernance des données",
      description: "Contrôles sur les données d’entraînement/validation et leur qualité.",
      legalRef: "EU AI Act (data governance)",
      category: "data",
      criticality: "HIGH",
    },
    {
      id: "doc-1",
      title: "Documentation technique",
      description: "Documentation suffisante pour démontrer la conformité.",
      legalRef: "EU AI Act (technical documentation)",
      category: "documentation",
      criticality: "HIGH",
    },
    {
      id: "doc-2",
      title: "Instructions d’utilisation",
      description: "Informations claires pour l’usage conforme du système IA.",
      legalRef: "EU AI Act (instructions for use)",
      category: "documentation",
      criticality: "MEDIUM",
    },
    {
      id: "log-1",
      title: "Journalisation / logs",
      description: "Logs et traçabilité des opérations clés.",
      legalRef: "EU AI Act (logging)",
      category: "logging",
      criticality: "MEDIUM",
    },
    {
      id: "mon-1",
      title: "Surveillance et suivi",
      description: "Monitoring post-déploiement et mécanismes d’alerte.",
      legalRef: "EU AI Act (post-market monitoring)",
      category: "monitoring",
      criticality: "HIGH",
    },
    {
      id: "tra-1",
      title: "Transparence",
      description: "Informations aux utilisateurs/concernés sur le fonctionnement.",
      legalRef: "EU AI Act (transparency)",
      category: "transparency",
      criticality: "MEDIUM",
    },
    {
      id: "tra-2",
      title: "Information des personnes concernées",
      description: "Communication adaptée selon le cas d’usage.",
      legalRef: "EU AI Act (transparency)",
      category: "transparency",
      criticality: "MEDIUM",
    },
    {
      id: "hum-1",
      title: "Supervision humaine",
      description: "Mécanismes d’intervention humaine (override, escalade, etc.).",
      legalRef: "EU AI Act (human oversight)",
      category: "human-oversight",
      criticality: "HIGH",
    },
    {
      id: "ho-1",
      title: "Contrôles et garde-fous opérationnels",
      description: "Procédures concrètes de contrôle en exploitation.",
      legalRef: "EU AI Act (human oversight)",
      category: "human-oversight",
      criticality: "MEDIUM",
    },
    {
      id: "dep-1",
      title: "Organisation du déploiement",
      description: "Process et responsabilités côté déploiement.",
      legalRef: "EU AI Act (deployer obligations)",
      category: "deployment",
      criticality: "MEDIUM",
    },
    {
      id: "dep-2",
      title: "Tests avant mise en production",
      description: "Tests, validation et critères d’acceptation.",
      legalRef: "EU AI Act (testing/validation)",
      category: "deployment",
      criticality: "HIGH",
    },
    {
      id: "dep-3",
      title: "Gestion des changements",
      description: "Maîtriser les évolutions qui impactent les risques.",
      legalRef: "EU AI Act (change management)",
      category: "deployment",
      criticality: "MEDIUM",
    },
    {
      id: "pm-1",
      title: "Gestion fournisseur / modèle",
      description: "Contrats, responsabilités, preuve de conformité.",
      legalRef: "EU AI Act (provider management)",
      category: "provider",
      criticality: "MEDIUM",
    },
    {
      id: "pm-2",
      title: "Traçabilité des versions",
      description: "Versioning modèle/données + historique des changements.",
      legalRef: "EU AI Act (traceability)",
      category: "provider",
      criticality: "HIGH",
    },
    {
      id: "data-1",
      title: "Protection des données",
      description: "Mesures de protection et minimisation (RGPD / sécurité).",
      legalRef: "GDPR + EU AI Act (data)",
      category: "data",
      criticality: "HIGH",
    },
    {
      id: "gen-1",
      title: "Gouvernance générale",
      description: "Organisation, rôles, politiques de conformité.",
      legalRef: "EU AI Act (governance)",
      category: "governance",
      criticality: "MEDIUM",
    },
    {
      id: "tech-1",
      title: "Robustesse & cybersécurité",
      description: "Sécurité, résilience, tests d’attaque, durcissement.",
      legalRef: "EU AI Act (robustness/cybersecurity)",
      category: "security",
      criticality: "CRITICAL",
    },
    {
      id: "rm-1",
      title: "Évaluation des risques",
      description: "Évaluer les risques spécifiques au cas d’usage.",
      legalRef: "EU AI Act (risk assessment)",
      category: "risk",
      criticality: "HIGH",
    },
    {
      id: "rm-2",
      title: "Mesures de réduction des risques",
      description: "Mesures concrètes pour diminuer risques et biais.",
      legalRef: "EU AI Act (risk mitigation)",
      category: "risk",
      criticality: "HIGH",
    },
    {
      id: "dg-1",
      title: "Gouvernance des données (process)",
      description: "Process, contrôles, responsabilités sur les datasets.",
      legalRef: "EU AI Act (data governance)",
      category: "data",
      criticality: "HIGH",
    },
    {
      id: "dg-2",
      title: "Qualité des données (contrôles)",
      description: "Contrôles qualité et représentativité.",
      legalRef: "EU AI Act (data quality)",
      category: "data",
      criticality: "HIGH",
    },
  ] as const;

  for (const it of items) {
    await prisma.obligationCatalog.upsert({
      where: { id: it.id },
      create: {
        id: it.id,
        title: it.title,
        description: it.description,
        legalRef: it.legalRef,
        category: it.category,
        criticality: it.criticality as any,
      },
      update: {
        title: it.title,
        description: it.description,
        legalRef: it.legalRef,
        category: it.category,
        criticality: it.criticality as any,
      },
    });
  }

  console.log(`✅ Seed OK: ${items.length} obligations catalogues upserted`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });