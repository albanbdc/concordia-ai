"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { OBLIGATIONS_CATALOG, getApplicabilityBadge } from "@/lib/obligations-catalog";

/* =======================
   Types (audit history)
======================= */

type AuditItem = {
  id: string;
  createdAt: string;
  sector: string;
  title: string;
  riskTier?: string;
  systemStatus?: string;
  complianceScore?: number;
};

type ApiUseCaseHistory =
  | { ok: true; useCaseKey: string; history: AuditItem[] }
  | { ok: false; error: string; details?: any };

/* =======================
   Types (obligations list)
======================= */

type ObligationListItem = {
  id: string; // Prisma state id (clé pour drawer)
  obligationId: string; // ex: rs-1

  obligation?: {
    id: string;
    title: string;
    description: string | null;
    legalRef: string | null;
    category: string | null;
    criticality: string | null;
  };

  status: string;
  priority: string;

  owner: string | null;
  dueDate: string | null;
  notes: string | null;

  lastAuditId: string | null;
  lastAuditAt: string | null;

  updatedAt: string;
  createdAt: string;

  historyPreview: Array<{
    id: string;
    type: string;
    message: string;
    createdAt: string;
    createdBy: string | null;
  }>;
};

type ApiObligationsList =
  | { ok: true; useCaseKey: string; obligations: ObligationListItem[] }
  | { ok: false; error: string; details?: any };

/* =======================
   Types (drawer detail)
======================= */

type DrawerHistoryEvent = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  createdBy: string | null;
  meta?: any;
};

type DrawerProof = {
  id: string;
  type?: string;
  label?: string;
  name?: string;
  url: string;
  createdAt?: string;
  createdBy?: string | null;
  deletedAt?: string | null;

  auditId?: string | null;
  auditAt?: string | null;
};

type DrawerPayload = {
  useCase: { id: string; key: string; title: string; sector: string };
  obligation: { id: string; title: string; description: string | null; legalRef: string | null };
  state: {
    id: string;
    obligationId: string;
    status: string;
    priority: string;
    owner: string | null;
    dueDate: string | null;
    notes: string | null;
    lastAuditId: string | null;
    lastAuditAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  proofs: DrawerProof[];
  history: DrawerHistoryEvent[];
};

type ApiAddProof =
  | {
      ok: true;
      proof: {
        id: string;
        url: string;
        label: string | null;
        type: string;
        createdAt: string;
        createdBy: string | null;
        auditId: string | null;
        auditAt: string | null;
      };
    }
  | { ok?: false; error: string; details?: any };

type ApiPatchProof =
  | {
      ok: true;
      proof: {
        id: string;
        url: string;
        label: string | null;
        type: string;
        createdAt: string | null;
        createdBy: string | null;
        auditId: string | null;
        auditAt: string | null;
        replacesProofId?: string;
      };
    }
  | { ok?: false; error: string; details?: any };

/* =======================
   Utils
======================= */

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function formatShortDate(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return String(iso);
  }
}

function safeJsonParse<T>(text: string): T | null {
  try {
    return text ? (JSON.parse(text) as T) : null;
  } catch {
    return null;
  }
}

function shortHash(h?: string | null) {
  if (!h || typeof h !== "string") return null;
  return h.length > 12 ? `${h.slice(0, 6)}…${h.slice(-4)}` : h;
}

function normalizeOwner(owner: string | null | undefined) {
  const v = (owner ?? "").trim();
  return v ? v : "—";
}

function statusRank(status: string) {
  const up = String(status || "").toUpperCase();
  if (up === "NON_COMPLIANT") return 0;
  if (up === "IN_PROGRESS") return 1;
  if (up === "NOT_EVALUATED") return 2;
  if (up === "COMPLIANT") return 3;
  return 4;
}

function uiStatusLabel(v: string) {
  const up = String(v || "").toUpperCase();
  if (up === "NON_COMPLIANT") return "Non conforme";
  if (up === "IN_PROGRESS") return "En cours";
  if (up === "COMPLIANT") return "Conforme";
  if (up === "NOT_EVALUATED") return "Non évaluée";
  return v;
}

function statusPill(status: string) {
  const up = String(status || "").toUpperCase();

  const cls =
    up === "COMPLIANT"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : up === "IN_PROGRESS"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : up === "NON_COMPLIANT"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : up === "NOT_EVALUATED"
      ? "bg-slate-50 text-slate-700 border-slate-200"
      : "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${cls}`}>
      {uiStatusLabel(up)}
    </span>
  );
}

function priorityPill(priority: string) {
  const up = String(priority || "").toUpperCase();
  const cls =
    up === "HIGH"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : up === "MEDIUM"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : up === "LOW"
      ? "bg-slate-50 text-slate-700 border-slate-200"
      : "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${cls}`}>
      {up}
    </span>
  );
}

function smallTag(text: string) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700">
      {text}
    </span>
  );
}

function dueBadge(iso: string | null | undefined) {
  if (!iso) return null;

  const d = new Date(iso);
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((day - today) / (1000 * 60 * 60 * 24));

  const isLate = diffDays < 0;
  const isSoon = diffDays >= 0 && diffDays <= 7;

  const cls = isLate
    ? "border-rose-200 bg-rose-50 text-rose-700"
    : isSoon
    ? "border-amber-200 bg-amber-50 text-amber-700"
    : "border-slate-200 bg-white text-slate-700";

  const right =
    isLate ? `${Math.abs(diffDays)} j de retard` : diffDays === 0 ? "aujourd’hui" : `${diffDays} j`;

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
      Deadline • {formatShortDate(iso)} • {right}
    </span>
  );
}

function historyUi(e: DrawerHistoryEvent) {
  const meta = e?.meta ?? {};
  const type = String(e?.type || "").toUpperCase();

  const isProofAdded = type === "PROOF_ADDED";
  const isProofRemoved = type === "PROOF_REMOVED";

  const replaces = meta?.replacesProofId ?? null;
  const replacedBy = meta?.replacedByProofId ?? null;

  const proofUrl = meta?.url ?? null;
  const proofLabel = meta?.label ?? null;
  const proofId = meta?.proofId ?? null;

  const integrityHash = shortHash(meta?.integrity?.hash ?? null);

  if (isProofAdded && replaces) {
    return {
      title: "Preuve modifiée (nouvelle version)",
      subtitle: proofLabel || proofUrl || proofId || "—",
      badge: `remplace ${replaces}`,
      hash: integrityHash,
      url: proofUrl,
    };
  }

  if (isProofRemoved && replacedBy) {
    return {
      title: "Preuve modifiée (ancienne version retirée)",
      subtitle: proofLabel || proofUrl || proofId || "—",
      badge: `remplacée par ${replacedBy}`,
      hash: integrityHash,
      url: proofUrl,
    };
  }

  if (isProofAdded) {
    return {
      title: "Preuve ajoutée",
      subtitle: proofLabel || proofUrl || proofId || "—",
      badge: null,
      hash: integrityHash,
      url: proofUrl,
    };
  }

  if (isProofRemoved) {
    return {
      title: "Preuve supprimée",
      subtitle: proofLabel || proofUrl || proofId || "—",
      badge: null,
      hash: integrityHash,
      url: proofUrl,
    };
  }

 return {
  title: e.message,
  subtitle: "",
  badge: null,
  hash: null,
  url: null,
};
}

/* =======================
   Minimal UI
======================= */

function FocusMini({
  compliant,
  inProgress,
  nonCompliant,
  notEvaluated,
}: {
  compliant: number;
  inProgress: number;
  nonCompliant: number;
  notEvaluated: number;
}) {
  const total = compliant + inProgress + nonCompliant + notEvaluated;
  const main = nonCompliant > 0 ? `${nonCompliant} à traiter` : inProgress > 0 ? `${inProgress} en cours` : "RAS";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
      <div className="min-w-0">
        <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">Résumé</div>
        <div className="mt-1 text-sm font-semibold text-slate-900 truncate">
          {total} obligations • <span className={nonCompliant > 0 ? "text-rose-700" : "text-slate-900"}>{main}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
          {nonCompliant}
        </span>
        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
          {inProgress}
        </span>
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
          {notEvaluated}
        </span>
        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
          {compliant}
        </span>
      </div>
    </div>
  );
}

function sectionTitle(title: string, subtitle?: string) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm font-bold text-slate-900">{title}</div>
        {subtitle ? <div className="mt-0.5 text-xs text-slate-500">{subtitle}</div> : null}
      </div>
    </div>
  );
}

/* =======================
   Component
======================= */

export default function UseCaseHistoryClient({ useCaseKey }: { useCaseKey: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // audit history
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AuditItem[]>([]);

  // obligations list
  const [obsLoading, setObsLoading] = useState(true);
  const [obsError, setObsError] = useState<string | null>(null);
  const [obligations, setObligations] = useState<ObligationListItem[]>([]);

  // controls
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "NON_COMPLIANT" | "IN_PROGRESS" | "COMPLIANT" | "NOT_EVALUATED"
  >("ALL");
  const [focusOnly, setFocusOnly] = useState(false);

  // ✅ Auto-focus seulement 1 fois
  const didAutoFocus = useRef(false);

  // drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerError, setDrawerError] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<DrawerPayload | null>(null);

  // form (editable)
  const [editOwner, setEditOwner] = useState<string>("");
  const [editDueDate, setEditDueDate] = useState<string>("");
  const [editNotes, setEditNotes] = useState<string>("");
  const [editStatus, setEditStatus] = useState<string>("IN_PROGRESS");

  // preuve (ajout)
  const [proofLabel, setProofLabel] = useState<string>("");
  const [proofUrl, setProofUrl] = useState<string>("");
  const [proofType, setProofType] = useState<"LINK" | "FILE" | "DOCUMENT">("LINK");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [proofBusy, setProofBusy] = useState(false);
  const [proofError, setProofError] = useState<string | null>(null);

  // preuve (édition / versioning B)
  const [editingProofId, setEditingProofId] = useState<string | null>(null);
  const [editProofLabel, setEditProofLabel] = useState<string>("");
  const [editProofUrl, setEditProofUrl] = useState<string>("");
  const [editProofType, setEditProofType] = useState<string>("LINK");
  const [proofActionBusyId, setProofActionBusyId] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  
  // Modal ajout obligation
const [addObModalOpen, setAddObModalOpen] = useState(false);
const [addObMode, setAddObMode] = useState<"catalog" | "custom">("catalog");
const [addObCatalogId, setAddObCatalogId] = useState("");
const [addObCustomTitle, setAddObCustomTitle] = useState("");
const [addObLoading, setAddObLoading] = useState(false);
const [addObError, setAddObError] = useState<string | null>(null);

  /* =======================
     Load: audit history
  ======================= */

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/usecases/${encodeURIComponent(useCaseKey)}`, { method: "GET" });
        const text = await res.text();
        const data = safeJsonParse<ApiUseCaseHistory>(text);

        if (!res.ok || !data || (data as any).ok !== true) {
          throw new Error((data as any)?.error || `Erreur API (${res.status})`);
        }

        if (!cancelled) setHistory(Array.isArray((data as any).history) ? (data as any).history : []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Erreur chargement historique");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [useCaseKey]);

  /* =======================
     Load: obligations list
  ======================= */

  async function loadObligations() {
    setObsLoading(true);
    setObsError(null);
    try {
      const res = await fetch(`/api/obligations?useCaseKey=${encodeURIComponent(useCaseKey)}`, { method: "GET" });
      const text = await res.text();
      const data = safeJsonParse<ApiObligationsList>(text);

      if (!res.ok || !data || (data as any).ok !== true) {
        throw new Error((data as any)?.error || `Erreur API (${res.status})`);
      }

      const list = Array.isArray((data as any).obligations) ? ((data as any).obligations as ObligationListItem[]) : [];
      setObligations(list);
    } catch (e: any) {
      setObsError(e?.message || "Erreur chargement obligations");
    } finally {
      setObsLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await loadObligations();
    })();
    return () => {
      cancelled = true;
    };
  }, [useCaseKey]);

  const head = history[0];

  /* =======================
     Drawer helpers
  ======================= */

  function openDrawer(stateId: string) {
    setSelectedStateId(stateId);
    setDrawerOpen(true);
  }

  function resetProofEditing() {
    setEditingProofId(null);
    setEditProofLabel("");
    setEditProofUrl("");
    setEditProofType("LINK");
    setProofActionBusyId(null);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setSelectedStateId(null);
    setDrawerError(null);
    setDrawer(null);

    setEditOwner("");
    setEditDueDate("");
    setEditNotes("");
    setEditStatus("IN_PROGRESS");

    setProofLabel("");
    setProofUrl("");
    setProofError(null);
    setProofBusy(false);

    resetProofEditing();

    setSaving(false);
    setDrawerLoading(false);
  }
async function addObligation() {
  setAddObError(null);

  if (addObMode === "catalog" && !addObCatalogId) {
    setAddObError("Sélectionnez une obligation du catalogue.");
    return;
  }

  if (addObMode === "custom" && !addObCustomTitle.trim()) {
    setAddObError("Le titre est requis.");
    return;
  }

  setAddObLoading(true);

  try {
    const res = await fetch(`/api/usecases/${encodeURIComponent(useCaseKey)}/obligations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        addObMode === "catalog"
          ? { type: "catalog", obligationId: addObCatalogId }
          : { type: "custom", title: addObCustomTitle.trim() }
      ),
    });

    const data = await res.json();
    if (!data?.ok) throw new Error(data?.error || "Erreur");

    setAddObModalOpen(false);
    setAddObCatalogId("");
    setAddObCustomTitle("");
    await loadObligations();
  } catch (e: any) {
    setAddObError(e?.message || "Erreur ajout obligation");
  } finally {
    setAddObLoading(false);
  }
}
  async function loadDrawer(stateId: string) {
    setDrawerLoading(true);
    setDrawerError(null);
    try {
      const res = await fetch(`/api/obligations/${encodeURIComponent(stateId)}`, { method: "GET" });
      const text = await res.text();
      const data = safeJsonParse<any>(text);

      if (!res.ok || !data) {
        throw new Error((data as any)?.error || `Erreur API (${res.status})`);
      }

      setDrawer(data as DrawerPayload);

      const owner = (data as DrawerPayload).state?.owner ?? "";
      const notes = (data as DrawerPayload).state?.notes ?? "";
      const due = (data as DrawerPayload).state?.dueDate ?? null;
      const st = (data as DrawerPayload).state?.status ?? "IN_PROGRESS";

      setEditOwner(owner);
      setEditNotes(notes);
      setEditDueDate(due ? String(due).slice(0, 10) : "");
      setEditStatus(String(st).toUpperCase());

      setProofLabel("");
      setProofUrl("");
      setProofError(null);

      resetProofEditing();
    } catch (e: any) {
      setDrawerError(e?.message || "Erreur chargement drawer");
    } finally {
      setDrawerLoading(false);
    }
  }

  useEffect(() => {
    if (!drawerOpen || !selectedStateId) return;
    loadDrawer(selectedStateId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerOpen, selectedStateId]);

  useEffect(() => {
    const openStateId = searchParams?.get("openStateId");
    if (!openStateId) return;

    if (drawerOpen && selectedStateId === openStateId) return;

    openDrawer(openStateId);
    router.replace(`/dashboard/usecases/${encodeURIComponent(useCaseKey)}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, useCaseKey]);

  async function saveDrawer(override?: Partial<{ status: string }>) {
    if (!selectedStateId) return;

    setSaving(true);
    setDrawerError(null);

    try {
      const body: any = {
        owner: editOwner ? editOwner : null,
        notes: editNotes ? editNotes : null,
        status: (override?.status ?? editStatus) ? String(override?.status ?? editStatus).toUpperCase() : null,
      };

      body.dueDate = editDueDate ? new Date(`${editDueDate}T00:00:00.000Z`).toISOString() : null;

      const res = await fetch(`/api/obligations/${encodeURIComponent(selectedStateId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await res.text();
      const data = safeJsonParse<any>(text);

      if (!res.ok || !data) {
        throw new Error((data as any)?.error || `Erreur API (${res.status})`);
      }

      setDrawer(data as DrawerPayload);

      if (override?.status) setEditStatus(String(override.status).toUpperCase());

      await loadObligations();
    } catch (e: any) {
      setDrawerError(e?.message || "Erreur sauvegarde");
    } finally {
      setSaving(false);
    }
  }
async function uploadFile(): Promise<string | null> {
  if (!selectedFile) return null;

  const fd = new FormData();
  fd.append("file", selectedFile);

  const res = await fetch("/api/uploads", {
    method: "POST",
    body: fd,
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : null;

  if (!res.ok) throw new Error(json?.error || "Upload échoué");

  return json?.url ?? null;
}
 async function addProof() {
  if (!selectedStateId) return;

  const label = proofLabel.trim();
  let url = proofUrl.trim();
  let type: "LINK" | "DOCUMENT" = "LINK";

  setProofError(null);
if (selectedFile && proofUrl.trim()) {
  setProofError("Ajoutez soit un lien, soit un document (pas les deux).");
  return;
}
  if (selectedFile) {
    try {
      const uploaded = await uploadFile();
      if (!uploaded) throw new Error("Upload échoué");

      url = uploaded;
      type = "DOCUMENT";
    } catch (e: any) {
      setProofError(e?.message || "Erreur upload document");
      return;
    }
  }

  if (!url) {
    setProofError("Lien ou document obligatoire.");
    return;
  }

  setProofBusy(true);

  try {
    const res = await fetch(`/api/obligations/${encodeURIComponent(selectedStateId)}/proofs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, label: label || undefined, type }),
    });

    const text = await res.text();
    const data = safeJsonParse<ApiAddProof>(text);

    if (!res.ok || !data || (data as any).ok !== true) {
      throw new Error((data as any)?.error || `Erreur API (${res.status})`);
    }

    setProofLabel("");
    setProofUrl("");
    setSelectedFile(null);

    await loadDrawer(selectedStateId);
    await loadObligations();
  } catch (e: any) {
    setProofError(e?.message || "Erreur ajout preuve");
  } finally {
    setProofBusy(false);
  }
}

  function startEditProof(p: DrawerProof) {
    setProofError(null);
    setEditingProofId(p.id);
    setEditProofLabel((p.label ?? p.name ?? "").trim());
    setEditProofUrl((p.url ?? "").trim());
    setEditProofType((p.type ?? "LINK").toUpperCase());
  }

  async function saveProofVersioning(proofId: string) {
    if (!selectedStateId) return;

    const url = editProofUrl.trim();
    const label = editProofLabel.trim();
    const type = (editProofType || "LINK").trim().toUpperCase();

    setProofError(null);

    if (!url) {
      setProofError("Le lien (URL) est obligatoire.");
      return;
    }

    setProofActionBusyId(proofId);

    try {
      const res = await fetch(
        `/api/obligations/${encodeURIComponent(selectedStateId)}/proofs/${encodeURIComponent(proofId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, label: label || undefined, type }),
        }
      );

      const text = await res.text();
      const data = safeJsonParse<ApiPatchProof>(text);

      if (!res.ok || !data || (data as any).ok !== true) {
        throw new Error((data as any)?.error || `Erreur API (${res.status})`);
      }

      resetProofEditing();

      await loadDrawer(selectedStateId);
      await loadObligations();
    } catch (e: any) {
      setProofError(e?.message || "Erreur modification preuve");
    } finally {
      setProofActionBusyId(null);
    }
  }

  async function deleteProof(proofId: string) {
    if (!selectedStateId) return;

    const ok = window.confirm("Supprimer cette preuve ? Cette action est enregistrée dans l’historique.");
    if (!ok) return;

    setProofError(null);
    setProofActionBusyId(proofId);

    try {
      const res = await fetch(
        `/api/obligations/${encodeURIComponent(selectedStateId)}/proofs/${encodeURIComponent(proofId)}`,
        { method: "DELETE" }
      );

      const text = await res.text();
      const json = safeJsonParse<any>(text);

      if (!res.ok) throw new Error(json?.error || `Erreur API (${res.status})`);

      if (editingProofId === proofId) resetProofEditing();

      await loadDrawer(selectedStateId);
      await loadObligations();
    } catch (e: any) {
      setProofError(e?.message || "Erreur suppression preuve");
    } finally {
      setProofActionBusyId(null);
    }
  }

  const complianceStats = useMemo(() => {
    const list = Array.isArray(obligations) ? obligations : [];
    const total = list.length;

    const compliant = list.filter((o) => String(o.status).toUpperCase() === "COMPLIANT").length;
    const inProgress = list.filter((o) => String(o.status).toUpperCase() === "IN_PROGRESS").length;
    const nonCompliant = list.filter((o) => String(o.status).toUpperCase() === "NON_COMPLIANT").length;
    const notEvaluated = list.filter((o) => String(o.status).toUpperCase() === "NOT_EVALUATED").length;

    return { total, compliant, inProgress, nonCompliant, notEvaluated };
  }, [obligations]);

  useEffect(() => {
    if (statusFilter !== "ALL") {
      setFocusOnly(false);
      return;
    }
    if (didAutoFocus.current) return;

    setFocusOnly(complianceStats.nonCompliant > 0);
    didAutoFocus.current = true;
  }, [statusFilter, complianceStats.nonCompliant]);

  const obligationsView = useMemo(() => {
    const list = Array.isArray(obligations) ? obligations : [];
    const query = q.trim().toLowerCase();

    const filtered = list.filter((o) => {
      const st = String(o.status || "").toUpperCase();

      if (focusOnly && statusFilter === "ALL" && st !== "NON_COMPLIANT") return false;
      if (statusFilter !== "ALL" && st !== statusFilter) return false;

      if (!query) return true;

      const title = (o.obligation?.title ?? o.obligationId ?? "").toLowerCase();
      const legal = (o.obligation?.legalRef ?? "").toLowerCase();
      const owner = (o.owner ?? "").toLowerCase();

      return title.includes(query) || legal.includes(query) || owner.includes(query);
    });

    return [...filtered].sort((a, b) => {
      const ra = statusRank(a.status);
      const rb = statusRank(b.status);
      if (ra !== rb) return ra - rb;
      return (b.updatedAt || "").localeCompare(a.updatedAt || "");
    });
  }, [obligations, q, statusFilter, focusOnly]);

  const proofs = Array.isArray(drawer?.proofs) ? drawer!.proofs : [];

  const useCaseTitle = head?.title ?? useCaseKey;
  const useCaseSector = head?.sector ?? null;

  /* =======================
     Render
  ======================= */

  return (
    <div className="p-8 space-y-6">
      {/* Header premium */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                  Registre vivant
                </span>
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                  Cas d’usage
                </span>
                {useCaseSector ? (
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                    Secteur : {useCaseSector}
                  </span>
                ) : null}
              </div>

              <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 truncate">
                {useCaseTitle}
              </h1>

              <div className="mt-2 text-sm text-slate-600 truncate">
                <span className="text-slate-400">Identifiant :</span>{" "}
                <span className="font-semibold text-slate-900">{useCaseKey}</span>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <Link
                href="/dashboard/mapping"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
              >
                ← Retour Mapping
              </Link>

              <button
                type="button"
                onClick={loadObligations}
                className="inline-flex items-center rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Rafraîchir
              </button>
            </div>
          </div>

          <div className="mt-5">
            <FocusMini
              compliant={complianceStats.compliant}
              inProgress={complianceStats.inProgress}
              nonCompliant={complianceStats.nonCompliant}
              notEvaluated={complianceStats.notEvaluated}
            />
          </div>
        </div>
      </div>

      {/* Obligations */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="text-sm font-bold text-slate-900">Registre vivant — obligations</div>
            <div className="text-xs text-slate-500">
              {obligationsView.length} affichées • {complianceStats.total} total
            </div>
          </div>

        <div className="flex items-center gap-2">
  <button
    type="button"
    onClick={() => setAddObModalOpen(true)}
    className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
  >
    + Ajouter
  </button>
  <button
    type="button"
    onClick={loadObligations}
    className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
  >
    Rafraîchir
  </button>
</div>
        </div>

        <div className="sticky top-6 z-20 border-b border-slate-200 bg-white/85 backdrop-blur px-4 py-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setFocusOnly((v) => !v)}
                className={[
                  "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold",
                  focusOnly
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
                title="Afficher uniquement les obligations non conformes (uniquement quand Statut = tous)"
              >
                {focusOnly ? "Focus : à traiter" : "Tout afficher"}
              </button>

              <select
                value={statusFilter}
                onChange={(e) => {
                  const v = e.target.value as any;
                  setStatusFilter(v);
                  if (v !== "ALL") setFocusOnly(false);
                }}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/10"
                title="Filtrer par statut"
              >
                <option value="ALL">Statut : tous</option>
                <option value="NON_COMPLIANT">Statut : non conformes</option>
                <option value="IN_PROGRESS">Statut : en cours</option>
                <option value="NOT_EVALUATED">Statut : non évaluées</option>
                <option value="COMPLIANT">Statut : conformes</option>
              </select>

              <span className="hidden sm:inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                {obligationsView.length} affichées
              </span>
            </div>

            <div className="w-full sm:w-80">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher…"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
          </div>
        </div>

        {obsLoading ? <div className="p-4 text-slate-600 text-sm">Chargement des obligations…</div> : null}
        {obsError ? (
          <div className="p-4">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{obsError}</div>
          </div>
        ) : null}

        {!obsLoading && !obsError ? (
          <div className="p-2">
            {obligationsView.length === 0 ? (
              <div className="m-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Rien à afficher.
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {obligationsView.map((o) => {
                  const title = o.obligation?.title ?? o.obligationId;
                  const legalRef = o.obligation?.legalRef ?? null;

                  const st = String(o.status || "").toUpperCase();
                  const owner = (o.owner ?? "").trim();
                  const due = o.dueDate ?? null;

                  const category = (o.obligation?.category ?? "").trim();
                  const criticality = (o.obligation?.criticality ?? "").trim();

                  const lastMsg = o.historyPreview?.[0]?.message?.trim() ? o.historyPreview[0].message.trim() : null;

                  const sideBarCls =
                    st === "NON_COMPLIANT"
                      ? "bg-rose-600"
                      : st === "IN_PROGRESS"
                      ? "bg-amber-500"
                      : st === "COMPLIANT"
                      ? "bg-emerald-600"
                      : "bg-slate-300";

                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => openDrawer(o.id)}
                      className={[
                        "group relative w-full text-left rounded-2xl border border-slate-200 bg-white",
                        "px-4 py-4 hover:bg-slate-50 transition",
                        "focus:outline-none focus:ring-2 focus:ring-slate-900/10",
                        "overflow-hidden",
                      ].join(" ")}
                    >
                      <div className={`absolute left-0 top-0 h-full w-[3px] ${sideBarCls}`} />

                      <div className="pl-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="text-[15px] font-semibold tracking-tight text-slate-900 truncate">
                                {title}
                              </div>

                              {st === "NON_COMPLIANT" ? (
                                <span className="shrink-0 inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                                  À traiter
                                </span>
                              ) : null}
                            </div>

                           <div className="mt-1 flex items-center gap-2 flex-wrap">
  <span className="text-xs text-slate-500 truncate">{legalRef ?? "—"}</span>
  {(() => {
    const catalog = OBLIGATIONS_CATALOG.find(c => c.id === o.obligationId);
    if (!catalog?.applicableFrom) return null;
    const badge = getApplicabilityBadge(catalog.applicableFrom);
    const cls = badge.color === "green"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-amber-200 bg-amber-50 text-amber-700";
    return (
      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
        {badge.isActive ? "✅" : "⏳"} {badge.label}
      </span>
    );
  })()}
</div>
                          </div>

                          <div className="shrink-0 flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                              {statusPill(o.status)}
                              {priorityPill(o.priority)}
                            </div>

                            <div className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                              Mis à jour : <span className="text-slate-700">{formatShortDate(o.updatedAt)}</span>
                            </div>

                            <div className="text-xs font-semibold text-slate-700 group-hover:translate-x-0.5 transition">
                              Ouvrir →
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 sm:hidden text-xs text-slate-600">{formatShortDate(o.updatedAt)}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Audit history */}
      <div>
        {loading ? <div className="text-slate-600">Chargement…</div> : null}
        {error ? <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">{error}</div> : null}

        {!loading && !error ? (
          <div className="mt-2 rounded-2xl border bg-white">
            <div className="border-b p-4 text-sm text-slate-600">
              {history.length} audit(s) • dernier : {head ? formatDate(head.createdAt) : "—"}
            </div>

            <div className="divide-y">
              {history.map((a, idx) => {
                const prev = history[idx + 1];
                const s = typeof a.complianceScore === "number" ? a.complianceScore : null;
                const p = typeof prev?.complianceScore === "number" ? prev.complianceScore : null;
                const delta = s !== null && p !== null ? s - p : null;

                return (
                  <Link
                    key={a.id}
                    href={`/dashboard/report?auditId=${encodeURIComponent(a.id)}`}
                    className="block p-4 hover:bg-slate-50"
                  >
                    <div className="flex justify-between gap-3 flex-wrap">
                      <div className="font-semibold">{formatDate(a.createdAt)}</div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="font-bold text-slate-900">
                          {typeof a.complianceScore === "number" ? `${a.complianceScore}/100` : "—"}
                        </span>
                        {delta !== null ? (
                          <span className={delta >= 0 ? "text-emerald-700 font-semibold" : "text-rose-700 font-semibold"}>
                            {delta >= 0 ? `+${delta}` : `${delta}`}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-1 text-xs text-slate-600">
                      {a.systemStatus ? `• ${a.systemStatus}` : ""}
                      {a.riskTier ? ` • Risk: ${a.riskTier}` : ""}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
{/* Modal ajout obligation */}
{addObModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/40" onClick={() => setAddObModalOpen(false)} />
    <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">Ajouter une obligation</h2>
        <button onClick={() => setAddObModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setAddObMode("catalog")}
          className={[
            "flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition",
            addObMode === "catalog"
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
          ].join(" ")}
        >
          Depuis le catalogue
        </button>
        <button
          type="button"
          onClick={() => setAddObMode("custom")}
          className={[
            "flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition",
            addObMode === "custom"
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
          ].join(" ")}
        >
          Obligation libre
        </button>
      </div>

      {/* Catalogue */}
      {addObMode === "catalog" && (
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
            Obligation du catalogue
          </label>
          <select
            value={addObCatalogId}
            onChange={(e) => setAddObCatalogId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
          >
            <option value="">— Sélectionner —</option>
            {OBLIGATIONS_CATALOG
              .filter(o => !obligations.find(existing => existing.obligationId === o.id))
              .map(o => (
                <option key={o.id} value={o.id}>
                  {o.id} — {o.title}
                </option>
              ))
            }
          </select>
        </div>
      )}

      {/* Custom */}
      {addObMode === "custom" && (
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
            Titre de l'obligation *
          </label>
          <input
            value={addObCustomTitle}
            onChange={(e) => setAddObCustomTitle(e.target.value)}
            placeholder="Ex : Politique interne de supervision IA"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
          />
        </div>
      )}

      {addObError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {addObError}
        </div>
      )}

      <button
        type="button"
        onClick={addObligation}
        disabled={addObLoading}
        className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:opacity-50 transition"
      >
        {addObLoading ? "Ajout…" : "Ajouter l'obligation →"}
      </button>
    </div>
  </div>
)}
      {/* Drawer premium */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={closeDrawer} />

          <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl flex flex-col">
            {/* Header sticky */}
            <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
              <div className="p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                      Obligation
                    </span>
                    {drawer?.state?.status ? statusPill(drawer.state.status) : null}
                    {drawer?.state?.priority ? priorityPill(drawer.state.priority) : null}
                  </div>

                  <div className="mt-2 text-lg font-bold truncate">
                    {drawer?.obligation?.title ?? drawer?.state?.obligationId ?? "Chargement…"}
                  </div>

                 <div className="mt-1 flex items-center gap-2 flex-wrap">
  {drawer?.obligation?.legalRef ? (
    <span className="text-xs font-semibold text-slate-600">{drawer.obligation.legalRef}</span>
  ) : (
    <span className="text-xs text-slate-500">—</span>
  )}
  {(() => {
    const obligationId = drawer?.state?.obligationId;
    if (!obligationId) return null;
    const catalog = OBLIGATIONS_CATALOG.find(c => c.id === obligationId);
    if (!catalog?.applicableFrom) return null;
    const badge = getApplicabilityBadge(catalog.applicableFrom);
    const cls = badge.color === "green"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-amber-200 bg-amber-50 text-amber-700";
    return (
      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
        {badge.isActive ? "✅" : "⏳"} {badge.label}
      </span>
    );
  })()}
</div>

                  <div className="mt-2 text-xs text-slate-600">
                    {drawer?.useCase?.title ? (
                      <>
                        <span className="font-semibold">{drawer.useCase.title}</span> • {drawer.useCase.sector}
                      </>
                    ) : (
                      useCaseKey
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeDrawer}
                  className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Fermer
                </button>
              </div>

              {/* mini infos */}
              {drawer?.state ? (
                <div className="px-4 pb-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between gap-3 flex-wrap">
                    <div className="text-xs text-slate-600">
                      Mise à jour : <span className="font-semibold">{formatDate(drawer.state.updatedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                        Owner : {normalizeOwner(drawer.state.owner)}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                        Deadline : {formatShortDate(drawer.state.dueDate)}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                        Preuves : {Array.isArray(drawer.proofs) ? drawer.proofs.length : 0}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto p-4 space-y-6">
              {drawerLoading ? <div className="text-sm text-slate-600">Chargement du détail…</div> : null}
              {drawerError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{drawerError}</div>
              ) : null}

              {!drawerLoading && drawer ? (
                <>
                  {/* Description */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    {sectionTitle("Description", "Texte de référence (audit-ready).")}
                    {drawer.obligation?.description ? (
                      <div className="mt-3 text-sm text-slate-700 whitespace-pre-line">
                        {drawer.obligation.description}
                      </div>
                    ) : (
                      <div className="mt-3 text-sm text-slate-500">—</div>
                    )}
                  </div>

                  {/* Actions / suivi */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    {sectionTitle("Suivi", "Statut, owner, deadline, notes.")}
                    <div className="mt-3 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs font-semibold text-slate-500 mb-1">Statut</div>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 bg-white"
                          >
                            <option value="NON_COMPLIANT">Non conforme</option>
                            <option value="IN_PROGRESS">En cours</option>
                            <option value="COMPLIANT">Conforme</option>
                            <option value="NOT_EVALUATED">Non évaluée</option>
                          </select>
                          <div className="mt-1 text-[11px] text-slate-500">
                            Actuel : <span className="font-semibold">{uiStatusLabel(drawer.state.status)}</span>
                          </div>
                        </div>

                        <div className="flex items-end gap-2">
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => saveDrawer({ status: "COMPLIANT" })}
                            className={[
                              "w-full inline-flex justify-center items-center rounded-xl border px-3 py-2 text-sm font-semibold",
                              "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                              saving ? "opacity-60" : "",
                            ].join(" ")}
                            title="Mettre le statut sur Conforme et sauvegarder"
                          >
                            Marquer conforme
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs font-semibold text-slate-500 mb-1">Responsable</div>
                          <input
                            value={editOwner}
                            onChange={(e) => setEditOwner(e.target.value)}
                            placeholder="Ex: Legal / DPO / CTO…"
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                          />
                        </div>

                        <div>
                          <div className="text-xs font-semibold text-slate-500 mb-1">Deadline</div>
                          <input
                            type="date"
                            value={editDueDate}
                            onChange={(e) => setEditDueDate(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                          />
                          <div className="mt-1 text-[11px] text-slate-500">Vide = aucune deadline.</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-slate-500 mb-1">Notes</div>
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          rows={4}
                          placeholder="Ce qui est fait / ce qui manque / décision…"
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preuves */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    {sectionTitle(
                      "Preuves",
                      "Ajoute des liens. “Modifier” = versioning (B) : nouvelle preuve + ancienne retirée."
                    )}

                    <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      {proofError ? (
                        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                          {proofError}
                        </div>
                      ) : null}

                      <div className="grid grid-cols-1 gap-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <div className="text-xs font-semibold text-slate-500 mb-1">Nom (optionnel)</div>
                            <input
                              value={proofLabel}
                              onChange={(e) => setProofLabel(e.target.value)}
                              placeholder="Ex: Procédure interne, PDF, ticket…"
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                            />
                          </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
  <div>
    <div className="text-xs font-semibold text-slate-500 mb-1">Lien (optionnel)</div>
    <input
      value={proofUrl}
      onChange={(e) => setProofUrl(e.target.value)}
      placeholder="https://…"
      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
    />
  </div>

  <div>
    <div className="text-xs font-semibold text-slate-500 mb-1">Document (upload)</div>
    <input
      type="file"
      onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
    />
  </div>
</div>
                        </div>

                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="text-[11px] text-slate-500">
                            Modèle preuve : <span className="font-semibold">C/E/B</span> (traçabilité + historique).
                          </div>

                          <button
                            type="button"
                            onClick={addProof}
                            disabled={proofBusy}
                            className={[
                              "inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white",
                              proofBusy ? "opacity-70" : "hover:bg-slate-800",
                            ].join(" ")}
                          >
                            {proofBusy ? "Ajout…" : "Ajouter la preuve"}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      {proofs.length > 0 ? (
                        <div className="space-y-2">
                          {proofs.map((p) => {
                            const isEditing = editingProofId === p.id;
                            const isBusy = proofActionBusyId === p.id;

                            return (
                              <div
                                key={p.id}
                                className="rounded-2xl border border-slate-200 bg-white p-3 hover:bg-slate-50 transition"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <div className="text-sm font-semibold text-slate-900 truncate">
                                        {p.label || p.name || "Preuve"}
                                      </div>
                                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700">
  {(p.type ?? "LINK").toUpperCase() === "DOCUMENT" ? "📄 DOCUMENT" : "🔗 LINK"}
</span>
                                    </div>

                                    <div className="mt-1 text-xs text-slate-600 truncate">
                                      <a href={p.url} target="_blank" rel="noreferrer" className="hover:underline">
                                        {p.url}
                                      </a>
                                    </div>

                                    <div className="mt-1 text-[11px] text-slate-500">
                                      {p.createdAt ? formatDate(p.createdAt) : "—"}
                                      {p.createdBy ? ` • ${p.createdBy}` : ""}
                                      {p.auditId ? ` • Audit: ${p.auditId}` : ""}
                                    </div>
                                  </div>

                                  <div className="shrink-0 flex items-center gap-2">
                                    {!isEditing ? (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => startEditProof(p)}
                                          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                                        >
                                          Modifier
                                        </button>

                                        <button
                                          type="button"
                                          disabled={isBusy}
                                          onClick={() => deleteProof(p.id)}
                                          className="inline-flex items-center rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                                        >
                                          {isBusy ? "Suppression…" : "Supprimer"}
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          type="button"
                                          disabled={isBusy}
                                          onClick={() => saveProofVersioning(p.id)}
                                          className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                                        >
                                          {isBusy ? "Sauvegarde…" : "Sauver"}
                                        </button>

                                        <button
                                          type="button"
                                          disabled={isBusy}
                                          onClick={() => resetProofEditing()}
                                          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
                                        >
                                          Annuler
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {isEditing ? (
                                  <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      <div>
                                        <div className="text-xs font-semibold text-slate-500 mb-1">Nom (optionnel)</div>
                                        <input
                                          value={editProofLabel}
                                          onChange={(e) => setEditProofLabel(e.target.value)}
                                          placeholder="Ex: Procédure interne, PDF, ticket…"
                                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                                        />
                                      </div>

                                      <div>
                                        <div className="text-xs font-semibold text-slate-500 mb-1">Type</div>
                                        <select
                                          value={editProofType}
                                          onChange={(e) => setEditProofType(e.target.value)}
                                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                                        >
                                          <option value="LINK">LINK</option>
                                          <option value="DOCUMENT">DOCUMENT</option>
                                          <option value="FILE">FILE</option>
                                        </select>
                                      </div>
                                    </div>

                                    <div>
                                      <div className="text-xs font-semibold text-slate-500 mb-1">Lien (obligatoire)</div>
                                      <input
                                        value={editProofUrl}
                                        onChange={(e) => setEditProofUrl(e.target.value)}
                                        placeholder="https://…"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                                      />
                                    </div>

                                    <div className="text-[11px] text-slate-500">
                                      ⚠️ “Modifier” = versioning (B) : nouvelle preuve créée + ancienne retirée (audit trail).
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-sm text-slate-500">Aucune preuve.</div>
                      )}
                    </div>
                  </div>

                  {/* Historique */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    {sectionTitle("Historique", "Ce qu’un contrôleur doit comprendre en 30 secondes.")}
                    <div className="mt-3 space-y-2">
                      {Array.isArray(drawer.history) && drawer.history.length > 0 ? (
                        drawer.history.map((e) => {
                          const ui = historyUi(e);
                          const proofIcon = e?.meta?.type === "DOCUMENT" ? "📄" : "🔗";
                          return (
                            <div key={e.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                              <div className="text-sm font-semibold text-slate-900">
  {e.type?.includes("PROOF") ? `${proofIcon} ${ui.title}` : ui.title}
</div>

                              {ui.subtitle ? (
                                <div className="mt-1 text-xs text-slate-700 truncate">
                                  {ui.url ? (
                                    <a href={ui.url} target="_blank" rel="noreferrer" className="hover:underline">
                                      {ui.subtitle}
                                    </a>
                                  ) : (
                                    ui.subtitle
                                  )}
                                </div>
                              ) : null}

                              <div className="mt-2 flex items-center gap-2 flex-wrap text-xs text-slate-500">
                                <span className="font-semibold text-slate-700">{formatDate(e.createdAt)}</span>
                                {e.createdBy ? smallTag(e.createdBy) : null}
                                {e.type ? smallTag(e.type) : null}
                                {ui.badge ? smallTag(ui.badge) : null}
                                {ui.hash ? smallTag(`hash ${ui.hash}`) : null}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-sm text-slate-600">Aucun événement.</div>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* Footer sticky (actions) */}
            {drawerOpen ? (
              <div className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/90 backdrop-blur p-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => saveDrawer()}
                    disabled={saving}
                    className={[
                      "inline-flex flex-1 justify-center items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white",
                      saving ? "opacity-70" : "hover:bg-slate-800",
                    ].join(" ")}
                  >
                    {saving ? "Sauvegarde…" : "Sauvegarder"}
                  </button>

                  <button
                    type="button"
                    onClick={() => selectedStateId && loadDrawer(selectedStateId)}
                    disabled={saving}
                    className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                  >
                    Recharger
                  </button>

                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}