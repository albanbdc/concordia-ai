// src/domain/concordia/risk-reasons.ts

import {
  AiSystem,
  AiUseCase,
  RiskLevel,
  SystemStatus,
} from "./types";

/**
 * Génère une liste de raisons (style consulting) expliquant
 * pourquoi le SYSTÈME est classé avec ce statut IA Act.
 */
export function computeSystemRiskReasons(
  system: AiSystem,
  status: SystemStatus
): string[] {
  const useCases = system.useCases ?? [];

  const hasEmployment = useCases.some(
    (u) => u.sector === "employment" || u.sector === "hr"
  );
  const hasFinance = useCases.some((u) => u.sector === "finance");
  const hasHealth = useCases.some((u) => u.sector === "health");
  const hasEducation = useCases.some((u) => u.sector === "education");
  const hasPublic = useCases.some((u) => u.sector === "public");
  const hasLaw = useCases.some((u) => u.isLawEnforcementUseCase);
  const hasInfra = useCases.some((u) => u.isCriticalInfrastructure);

  const impactsRights = useCases.some(
    (u) => u.affectsRights || u.vulnerableGroups
  );
  const usesBiometric = useCases.some((u) => u.biometric);
  const safetyCritical = useCases.some((u) => u.safetyCritical);

  const reasons: string[] = [];

  switch (status) {
    case "prohibited":
      reasons.push(
        "Le système met en œuvre au moins une pratique explicitement interdite par l’IA Act (ex. techniques manipulatoires, notation sociale ou prédiction policière)."
      );
      break;

    case "high-risk":
      if (hasEmployment) {
        reasons.push(
          "Le système intervient dans le domaine de l’emploi / des ressources humaines, listé comme secteur à haut risque dans l’annexe III de l’IA Act."
        );
      }
      if (hasFinance) {
        reasons.push(
          "Le système a un impact potentiel sur des décisions financières sensibles, susceptibles d’affecter l’accès à des services essentiels (crédit, assurance, etc.)."
        );
      }
      if (hasHealth) {
        reasons.push(
          "Le système est utilisé dans un contexte de santé, avec un impact possible sur la prise en charge ou le diagnostic des personnes."
        );
      }
      if (hasEducation) {
        reasons.push(
          "Le système est déployé dans le secteur de l’éducation, où il peut influence l’orientation, l’évaluation ou l’accès à des parcours scolaires."
        );
      }
      if (hasPublic) {
        reasons.push(
          "Le système est utilisé dans le secteur public, avec des effets possibles sur l’accès à des droits ou des services administratifs."
        );
      }
      if (hasLaw) {
        reasons.push(
          "Certains cas d’usage sont liés au maintien de l’ordre ou à l’application de la loi, ce qui renforce considérablement le niveau de risque."
        );
      }
      if (hasInfra) {
        reasons.push(
          "Le système intervient sur ou autour d’infrastructures critiques, avec des conséquences potentielles importantes en cas de dysfonctionnement."
        );
      }
      if (impactsRights) {
        reasons.push(
          "Le traitement réalisé par le système peut affecter directement les droits fondamentaux des personnes concernées (accès à un emploi, à un service, à une décision individuelle)."
        );
      }
      if (usesBiometric) {
        reasons.push(
          "Le système manipule des données biométriques, considérées comme particulièrement sensibles par la réglementation."
        );
      }
      if (safetyCritical) {
        reasons.push(
          "Les décisions ou recommandations émises par le système peuvent avoir un impact significatif sur la sécurité ou l’intégrité physique des personnes."
        );
      }
      if (reasons.length === 0) {
        reasons.push(
          "Le système présente un ensemble de caractéristiques (secteur, contexte d’utilisation, impact potentiel) qui le rapprochent des scénarios de haut risque définis par l’IA Act."
        );
      }
      break;

    case "gpai-systemic":
      reasons.push(
        "Le modèle présente un risque systémique, en raison de sa portée, de sa capacité d’usage général et de la possibilité d’être intégré dans une grande diversité de cas d’usage sensibles."
      );
      reasons.push(
        "Des obligations renforcées s’appliquent, notamment en matière de transparence, d’évaluation des risques et de gouvernance tout au long du cycle de vie."
      );
      break;

    case "gpai":
      reasons.push(
        "Le système est un modèle d’IA à usage général (GPAI), susceptible d’être réutilisé dans différents contextes applicatifs, y compris potentiellement à haut risque."
      );
      reasons.push(
        "Il doit être accompagné d’une documentation technique et de consignes d’utilisation claires pour les déployeurs."
      );
      break;

    case "excluded":
      reasons.push(
        "L’utilisation actuelle du système est limitée à des activités de recherche et développement, sans déploiement opérationnel direct auprès d’utilisateurs finaux."
      );
      reasons.push(
        "Dans ce cadre, le système bénéficie d’un régime d’exclusion prévu par l’IA Act, mais reste à surveiller en cas d’industrialisation future."
      );
      break;

    case "out-of-scope":
      reasons.push(
        "Le système ne remplit pas les critères matériels d’application de l’IA Act dans son usage actuel (ex. usage personnel, militaire ou expérimental spécifique)."
      );
      break;

    case "normal":
    default:
      reasons.push(
        "Le système ne relève pas des catégories à haut risque ni des pratiques interdites définies par l’IA Act."
      );
      if (impactsRights) {
        reasons.push(
          "Certaines décisions peuvent néanmoins avoir un impact sur les individus, ce qui justifie la mise en place de bonnes pratiques de gouvernance et de transparence."
        );
      } else {
        reasons.push(
          "Les cas d’usage identifiés ont un impact limité, avec un niveau de risque jugé compatible avec un régime de conformité standard."
        );
      }
      break;
  }

  return reasons;
}

/**
 * Génère une liste de raisons explicatives pour un USE CASE donné
 * (tri de CV, scoring crédit, classification de dossiers, etc.).
 */
export function computeUseCaseRiskReasons(
  uc: AiUseCase,
  riskLevel: RiskLevel
): string[] {
  const reasons: string[] = [];

  const isEmployment = uc.sector === "employment" || uc.sector === "hr";
  const isFinance = uc.sector === "finance";
  const isHealth = uc.sector === "health";
  const isEducation = uc.sector === "education";
  const isPublic = uc.sector === "public";

  if (isEmployment) {
    reasons.push(
      "Le cas d’usage concerne l’emploi ou la gestion de candidatures, un domaine particulièrement surveillé en raison des risques de discrimination."
    );
  }

  if (isFinance) {
    reasons.push(
      "Le cas d’usage intervient dans le secteur financier, où les décisions peuvent conditionner l’accès à des services essentiels (crédit, assurance, etc.)."
    );
  }

  if (isHealth) {
    reasons.push(
      "Le cas d’usage est lié à la santé, avec un impact potentiel sur la prise en charge, le diagnostic ou le suivi des patients."
    );
  }

  if (isEducation) {
    reasons.push(
      "Le cas d’usage touche à l’éducation, avec une influence possible sur l’orientation, l’évaluation ou l’accès à des parcours scolaires."
    );
  }

  if (isPublic) {
    reasons.push(
      "Le cas d’usage s’inscrit dans le secteur public, ce qui peut affecter l’accès à des droits ou à des services administratifs."
    );
  }

  if (uc.affectsRights) {
    reasons.push(
      "Les décisions ou recommandations de ce système peuvent avoir un impact direct sur la situation individuelle des personnes concernées (droits, accès à un service, opportunité)."
    );
  }

  if (uc.vulnerableGroups) {
    reasons.push(
      "Le système cible ou affecte des groupes considérés comme vulnérables, ce qui renforce la sensibilité du cas d’usage."
    );
  }

  if (uc.biometric) {
    reasons.push(
      "Le cas d’usage repose sur l’utilisation de données biométriques, intrinsèquement sensibles et fortement encadrées par la réglementation."
    );
  }

  if (uc.safetyCritical) {
    reasons.push(
      "Une erreur ou une dérive du système pourrait avoir des conséquences significatives sur la sécurité ou l’intégrité physique des personnes."
    );
  }

  // Si aucun flag ne ressort mais que le risque est élevé :
  if (reasons.length === 0 && riskLevel === "high") {
    reasons.push(
      "Le niveau de risque est élevé en raison de la combinaison de facteurs d’impact et du contexte d’utilisation, même si aucun indicateur isolé ne ressort fortement."
    );
  }

  if (reasons.length === 0 && riskLevel === "limited") {
    reasons.push(
      "Le risque est jugé limité : l’impact sur les individus existe mais reste circonscrit et maîtrisable avec des mesures de gouvernance adaptées."
    );
  }

  if (reasons.length === 0 && riskLevel === "minimal") {
    reasons.push(
      "Le cas d’usage présente un niveau de risque faible, avec un impact limité sur les personnes et un usage principalement support ou assistanciel."
    );
  }

  return reasons;
}
