// lib/auditIntegrity.ts

import { createHash } from "crypto";

type AuditLike = {
  id: string;
  createdAt: Date | string;
  type: string;
  industrySector?: string | null;
  useCaseType?: string | null;
  internalDepartment?: string | null;
  inputText: string;
  resultText: string;
  integrityHash?: string | null;
};

/**
 * Construit une "signature" texte stable d'un audit
 * qu'on va ensuite hasher avec SHA-256.
 */
function buildAuditSignature(audit: AuditLike): string {
  const parts = [
    `id=${audit.id}`,
    `createdAt=${new Date(audit.createdAt).toISOString()}`,
    `type=${audit.type || ""}`,
    `industrySector=${audit.industrySector || ""}`,
    `useCaseType=${audit.useCaseType || ""}`,
    `internalDepartment=${audit.internalDepartment || ""}`,
    `inputText=${audit.inputText || ""}`,
    `resultText=${audit.resultText || ""}`,
  ];

  return parts.join("\n");
}

/**
 * Calcule le hash SHA-256 d'un audit (contenu + méta)
 * à partir de la signature construite.
 */
export function computeAuditHash(audit: AuditLike): string {
  const signature = buildAuditSignature(audit);
  const hash = createHash("sha256").update(signature, "utf8").digest("hex");
  return hash;
}

/**
 * Indique si l'audit a été modifié depuis sa dernière certification.
 * - true  => l'audit a changé (hash actuel ≠ hash enregistré)
 * - false => l'audit est identique à la version certifiée
 * - null  => l'audit n'a jamais été certifié (pas de hash enregistré)
 */
export function isAuditModifiedSinceCertification(
  audit: AuditLike
): boolean | null {
  if (!audit.integrityHash) {
    return null; // jamais certifié
  }

  const currentHash = computeAuditHash(audit);
  return currentHash !== audit.integrityHash;
}
