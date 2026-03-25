// src/domain/concordia/drawer.contract.ts
// Contrat unique du Drawer "Détail obligation"
// - Types TypeScript (front & back)
// - Validation Zod (sécurité des données)
// Règle : SIMPLE, LISIBLE, SANS JARGON

import { z } from "zod";

// =========================
// Enums UI (simples)
// =========================

export const ObligationStatusEnum = z.enum([
  "NOT_EVALUATED",
  "IN_PROGRESS",
  "COMPLIANT",
  "NON_COMPLIANT",
]);
export type ObligationStatus = z.infer<typeof ObligationStatusEnum>;

// ✅ Proof types : on accepte le réel (DOCUMENT) + on garde FILE/LINK (compat)
export const ProofTypeEnum = z.enum(["FILE", "LINK", "DOCUMENT"]);
export type ProofType = z.infer<typeof ProofTypeEnum>;

export const HistoryEventTypeEnum = z.enum([
  "STATE_CREATED",
  "OWNER_CHANGED",
  "DEADLINE_CHANGED",
  "NOTES_UPDATED",
  "STATUS_CHANGED",
  "PROOF_ADDED",
  "PROOF_REMOVED",
]);
export type HistoryEventType = z.infer<typeof HistoryEventTypeEnum>;

// =========================
// Helpers Zod
// =========================

const cuidSchema = z.string().min(10);
const isoDateSchema = z.string(); // permissif (string ISO)

// =========================
// DTO — Liste (Écran 2)
// =========================

export const ObligationRowSchema = z.object({
  id: cuidSchema, // UseCaseObligationState.id
  obligationId: z.string(), // clé obligation
  obligationTitle: z.string(), // titre lisible
  status: z.string(), // V1: string (aligné avec ton schéma actuel)
  priority: z.string(),
  owner: z.string().nullable().optional(),
  dueDate: isoDateSchema.nullable().optional(),
  hasProof: z.boolean().optional(),
  lastAuditId: z.string().nullable().optional(),
  lastAuditAt: isoDateSchema.nullable().optional(),
  updatedAt: isoDateSchema,
});
export type ObligationRowDTO = z.infer<typeof ObligationRowSchema>;

// =========================
// DTO — Drawer (lecture)
// =========================

export const DrawerUseCaseSchema = z.object({
  id: cuidSchema,
  key: z.string(),
  title: z.string(),
  sector: z.string(),
});

export const DrawerObligationSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  legalRef: z.string().nullable().optional(), // ex: "AIAct:Art-11"
  criticality: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
});

export const DrawerStateSchema = z.object({
  id: cuidSchema, // UseCaseObligationState.id
  obligationId: z.string(),
  status: z.string(), // V1: string
  priority: z.string(),
  owner: z.string().nullable().optional(),
  dueDate: isoDateSchema.nullable().optional(),
  notes: z.string().nullable().optional(),
  lastAuditId: z.string().nullable().optional(),
  lastAuditAt: isoDateSchema.nullable().optional(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

// ✅ Proof : on supporte label (nouveau) ET name (ancien) pour ne rien casser
export const ProofSchema = z.object({
  id: cuidSchema,
  type: ProofTypeEnum,
  label: z.string().optional(),
  name: z.string().optional(),
  url: z.string(),
  createdAt: isoDateSchema.optional(),
  createdBy: z.string().nullable().optional(),
  deletedAt: isoDateSchema.nullable().optional(),
  auditId: z.string().nullable().optional(),
  auditAt: isoDateSchema.nullable().optional(),
});
export type ProofDTO = z.infer<typeof ProofSchema>;

export const HistoryEventSchema = z.object({
  id: cuidSchema,
  type: HistoryEventTypeEnum,
  message: z.string(),
  createdAt: isoDateSchema,
  createdBy: z.string().nullable().optional(),
  meta: z.object({}).passthrough().optional(),
});
export type HistoryEventDTO = z.infer<typeof HistoryEventSchema>;

export const ObligationDrawerSchema = z.object({
  useCase: DrawerUseCaseSchema,
  obligation: DrawerObligationSchema,
  state: DrawerStateSchema,
  proofs: z.array(ProofSchema),
  history: z.array(HistoryEventSchema),
});
export type ObligationDrawerDTO = z.infer<typeof ObligationDrawerSchema>;

// =========================
// Schemas — Mutations (API)
// =========================

// ✅ PATCH owner / dueDate / notes / status
export const PatchStateSchema = z.object({
  owner: z.string().nullable().optional(),
  dueDate: isoDateSchema.nullable().optional(),
  notes: z.string().nullable().optional(),
  status: ObligationStatusEnum.nullable().optional(),
});
export type PatchStateInput = z.infer<typeof PatchStateSchema>;

// ✅ POST proof : label/name VRAIMENT optionnels (aligné avec ton UI)
export const CreateProofSchema = z.object({
  type: ProofTypeEnum,
  label: z.string().optional(),
  name: z.string().optional(),
  url: z.string().min(1),
});
export type CreateProofInput = z.infer<typeof CreateProofSchema>;

// =========================
// Schemas — Params (API)
// =========================

export const DrawerParamsSchema = z.object({
  useCaseKey: z.string().min(1),
  stateId: cuidSchema,
});
export type DrawerParams = z.infer<typeof DrawerParamsSchema>;