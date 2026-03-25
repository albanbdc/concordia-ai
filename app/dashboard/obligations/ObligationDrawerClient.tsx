// app/dashboard/obligations/ObligationDrawerClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { ObligationDrawerDTO } from "@/domain/concordia/drawer.contract";

type Props = {
  stateId: string | null;
  onClose: () => void;
};

type PatchBody = {
  owner?: string | null;
  dueDate?: string | null;
  notes?: string | null;
};

type ProofType = "FILE" | "LINK" | "DOCUMENT";

type CreateProofBody = {
  type: ProofType;
  label?: string;
  name?: string; // compat ancien
  url: string;
};

type PatchProofBody = {
  type: ProofType;
  label?: string;
  url: string;
};

function isoToInputDate(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function inputDateToIso(date: string) {
  if (!date) return null;
  const d = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function prettyDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("fr-FR");
  } catch {
    return iso;
  }
}

function normNullableString(v: any) {
  if (v === null || v === undefined) return null;
  const s = String(v);
  return s.length ? s : null;
}

function getProofLabel(p: any) {
  return (p?.label ?? p?.name ?? "").toString().trim();
}

function getHistoryMeta(h: any) {
  const m = h?.meta;
  return m && typeof m === "object" ? m : null;
}

function shortId(id: any) {
  if (!id) return null;
  const s = String(id);
  return s.length > 10 ? `${s.slice(0, 8)}…` : s;
}

function mergeHistoryForProofVersioning(history: any[]) {
  const out: any[] = [];
  for (let i = 0; i < history.length; i++) {
    const h = history[i];
    const next = history[i + 1];

    const hMeta = getHistoryMeta(h);
    const nextMeta = getHistoryMeta(next);

    const isRemoved = h?.type === "PROOF_REMOVED" && hMeta?.replacedByProofId;
    const isAdded =
      next?.type === "PROOF_ADDED" &&
      nextMeta?.replacesProofId &&
      nextMeta?.replacesProofId === hMeta?.proofId;

    if (isRemoved && isAdded) {
      out.push({
        id: `${h.id}__${next.id}__MERGED`,
        type: "PROOF_UPDATED",
        message: "Preuve modifiée",
        createdAt: h.createdAt,
        createdBy: h.createdBy ?? next.createdBy ?? null,
        meta: {
          from: {
            proofId: hMeta?.proofId ?? null,
            label: hMeta?.label ?? null,
            url: hMeta?.url ?? null,
            type: hMeta?.type ?? null,
          },
          to: {
            proofId: nextMeta?.proofId ?? null,
            label: nextMeta?.label ?? null,
            url: nextMeta?.url ?? null,
            type: nextMeta?.type ?? null,
          },
          // ✅ C : hash opposable
          integrity: hMeta?.integrity ?? nextMeta?.integrity ?? null,
          // ✅ E : lien audit (si présent)
          linkedAuditId: hMeta?.linkedAuditId ?? nextMeta?.linkedAuditId ?? null,
          linkedAuditAt: hMeta?.linkedAuditAt ?? nextMeta?.linkedAuditAt ?? null,
        },
      });

      i++;
      continue;
    }

    out.push(h);
  }
  return out;
}

export default function ObligationDrawerClient({ stateId, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ObligationDrawerDTO | null>(null);

  const [owner, setOwner] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

const [proofType, setProofType] = useState<ProofType>("LINK");
const [proofLabel, setProofLabel] = useState("");
const [proofUrl, setProofUrl] = useState("");
const [selectedFile, setSelectedFile] = useState<File | null>(null); // ✅ NEW
const [proofBusy, setProofBusy] = useState(false);
const [editingProofId, setEditingProofId] = useState<string | null>(null);

  const isOpen = !!stateId;

  async function refresh() {
    if (!stateId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/obligations/${encodeURIComponent(stateId)}`, {
        method: "GET",
      });
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;

      if (!res.ok) throw new Error(json?.error || `Erreur API (${res.status})`);

      setData(json as ObligationDrawerDTO);

      setOwner((json?.state?.owner ?? "") as string);
      setDueDate(isoToInputDate(json?.state?.dueDate ?? null));
      setNotes((json?.state?.notes ?? "") as string);
    } catch (e: any) {
      setError(e?.message || "Erreur chargement drawer");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateId]);

  const title = useMemo(() => {
    if (!data) return "Détail obligation";
    const t = (data as any)?.obligation?.title;
    const id = (data as any)?.obligation?.id || (data as any)?.state?.obligationId;
    return t ? String(t) : id ? String(id) : "Détail obligation";
  }, [data]);

  const catalog = useMemo(() => {
    if (!data) return null;
    const o = (data as any)?.obligation ?? null;
    if (!o) return null;
    return {
      id: o.id ?? null,
      title: o.title ?? null,
      description: o.description ?? null,
      legalRef: o.legalRef ?? null,
      category: o.category ?? null,
      criticality: o.criticality ?? null,
    };
  }, [data]);

  const baseline = useMemo(() => {
    return {
      owner: data?.state?.owner ?? "",
      dueDate: isoToInputDate(data?.state?.dueDate ?? null),
      notes: data?.state?.notes ?? "",
    };
  }, [data]);

  const dirty = useMemo(() => {
    if (!data) return false;
    return owner !== baseline.owner || dueDate !== baseline.dueDate || notes !== baseline.notes;
  }, [data, owner, dueDate, notes, baseline]);

  const mergedHistory = useMemo(() => {
    const raw = (data as any)?.history ?? [];
    if (!Array.isArray(raw)) return [];
    return mergeHistoryForProofVersioning(raw);
  }, [data]);

  function buildPatchBody(): PatchBody {
    const patch: PatchBody = {};

    if (owner !== baseline.owner) {
      const v = owner.trim();
      patch.owner = v ? v : null;
    }

    if (dueDate !== baseline.dueDate) {
      patch.dueDate = dueDate ? inputDateToIso(dueDate) : null;
    }

    if (notes !== baseline.notes) {
      const v = notes.trim();
      patch.notes = v ? notes : null;
    }

    return patch;
  }

  async function patchState(body: PatchBody) {
    if (!stateId) return;
    if (!body || Object.keys(body).length === 0) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/obligations/${encodeURIComponent(stateId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;

      if (!res.ok) throw new Error(json?.error || `Erreur API (${res.status})`);
      setData(json as ObligationDrawerDTO);

      setOwner((json?.state?.owner ?? "") as string);
      setDueDate(isoToInputDate(json?.state?.dueDate ?? null));
      setNotes((json?.state?.notes ?? "") as string);
    } catch (e: any) {
      setError(e?.message || "Erreur sauvegarde");
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
  async function createProof() {
    if (!stateId) return;

 const label = proofLabel.trim();

if (!label) {
  setError("Il faut un label.");
  return;
}

let finalUrl = proofUrl.trim();

if (proofType !== "LINK") {
  if (!selectedFile) {
    setError("Fichier requis.");
    return;
  }

  try {
    const uploaded = await uploadFile();
    if (!uploaded) throw new Error("Upload KO");
    finalUrl = uploaded;
  } catch (e: any) {
    setError(e?.message || "Erreur upload");
    return;
  }
} else {
  if (!finalUrl) {
    setError("Lien requis.");
    return;
  }
}

const payload: CreateProofBody = {
  type: proofType,
  label,
  url: finalUrl,
};

    setProofBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/obligations/${encodeURIComponent(stateId)}/proofs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;

      if (!res.ok) throw new Error(json?.error || `Erreur API (${res.status})`);

      await refresh();

      setProofLabel("");
      setProofUrl("");
      setSelectedFile(null);
      setProofType("LINK");
      setEditingProofId(null);
    } catch (e: any) {
      setError(e?.message || "Erreur ajout preuve");
    } finally {
      setProofBusy(false);
    }
  }

  async function patchProof(proofId: string) {
    if (!stateId) return;

    const label = proofLabel.trim();
    const url = proofUrl.trim();

    if (!label || !url) {
      setError("Il faut un label + un lien pour modifier la preuve.");
      return;
    }

    const payload: PatchProofBody = { type: proofType, label, url };

    setProofBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/obligations/${encodeURIComponent(stateId)}/proofs/${encodeURIComponent(proofId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;

      if (!res.ok) throw new Error(json?.error || `Erreur API (${res.status})`);

      await refresh();

      setProofLabel("");
      setProofUrl("");
      setProofType("LINK");
      setEditingProofId(null);
    } catch (e: any) {
      setError(e?.message || "Erreur modification preuve");
    } finally {
      setProofBusy(false);
    }
  }

  async function deleteProof(proofId: string) {
  if (!stateId) return;
  if (!proofId) return;

  setProofBusy(true);
  setError(null);
  try {
    const res = await fetch(
      `/api/obligations/${encodeURIComponent(stateId)}/proofs/${encodeURIComponent(proofId)}`,
      { method: "DELETE" }
    );
    const text = await res.text();
    const json = text ? JSON.parse(text) : null;

    if (!res.ok) throw new Error(json?.error || `Erreur API (${res.status})`);

    await refresh();
  } catch (e: any) {
    setError(e?.message || "Erreur suppression preuve");
  } finally {
    setProofBusy(false);
  }
}

  function startEditProof(p: any) {
    setEditingProofId(p.id);
    setProofType((String(p.type || "LINK").toUpperCase() as ProofType) ?? "LINK");
    setProofLabel(getProofLabel(p));
    setProofUrl(String(p.url || ""));
    setError(null);
  }

  function cancelEditProof() {
    setEditingProofId(null);
    setProofType("LINK");
    setProofLabel("");
    setProofUrl("");
    setError(null);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
        aria-label="Fermer"
      />

      <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col">
        <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-500">Obligation</div>
            <h2 className="mt-1 text-lg font-bold truncate">{title}</h2>

            {catalog?.legalRef ? (
              <div className="mt-1 text-xs text-slate-600">
                <span className="font-semibold">Référence :</span> {catalog.legalRef}
              </div>
            ) : null}

            {data ? (
              <div className="mt-1 text-xs text-slate-600">
                <span className="font-semibold">{(data as any)?.useCase?.title ?? "—"}</span>{" "}
                • {(data as any)?.useCase?.sector ?? "—"}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Fermer
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {loading ? <div className="text-slate-600">Chargement…</div> : null}
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {data ? (
            <>
              <div className="rounded-2xl border border-slate-200 p-4 space-y-2">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="text-xs font-semibold text-slate-500">Base légale (catalogue)</div>
                  {!catalog ? (
                    <div className="text-xs text-amber-700 font-semibold">
                      Catalogue non chargé (fallback sur l’ID)
                    </div>
                  ) : null}
                </div>

                {catalog ? (
                  <>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-slate-500 font-semibold">Catégorie</div>
                        <div className="font-bold">{catalog.category ?? "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-semibold">Criticité</div>
                        <div className="font-bold">{catalog.criticality ?? "—"}</div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500">
                      <span className="font-semibold">Référence :</span> {catalog.legalRef ?? "—"}
                    </div>

                    {catalog.description ? (
                      <div className="text-sm text-slate-700 leading-relaxed">
                        {catalog.description}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="text-sm text-slate-600">
                    On n’a pas trouvé le détail “catalogue” pour cette obligation.
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 space-y-4">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="text-xs font-semibold text-slate-500">Champs “registre vivant”</div>
                  <div className="text-xs text-slate-500">
                    {dirty ? (
                      <span className="font-semibold text-slate-900">
                        Modifications non sauvegardées
                      </span>
                    ) : (
                      "OK"
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-600">Responsable</label>
                  <input
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="Ex: Legal, DPO, CTO…"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-600">Deadline</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <div className="text-xs text-slate-500">Vide = aucune deadline.</div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-600">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Contexte, décision, risque, justification…"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    disabled={saving || !dirty}
                    onClick={() => patchState(buildPatchBody())}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    {saving ? "Sauvegarde…" : "Sauvegarder"}
                  </button>

                  <button
                    type="button"
                    disabled={saving || !data}
                    onClick={() => {
                      setOwner(baseline.owner);
                      setDueDate(baseline.dueDate);
                      setNotes(baseline.notes);
                      setError(null);
                    }}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
                  >
                    Annuler
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 space-y-4">
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-500">Preuves</div>
                    <div className="text-sm font-bold">
                      {(data as any)?.proofs?.length ?? 0} preuve(s)
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={proofType}
                      onChange={(e) => setProofType(e.target.value as ProofType)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      disabled={proofBusy}
                    >
                      <option value="LINK">Lien</option>
                      <option value="FILE">Fichier</option>
                      <option value="DOCUMENT">Document</option>
                    </select>

                    <input
                      value={proofLabel}
                      onChange={(e) => setProofLabel(e.target.value)}
                      placeholder="Label (ex: Politique données v1)"
                      className="col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      disabled={proofBusy}
                    />
                  </div>
<div className="grid grid-cols-3 gap-2">
  {proofType === "LINK" ? (
    <input
      value={proofUrl}
      onChange={(e) => setProofUrl(e.target.value)}
      placeholder="URL"
      className="col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
      disabled={proofBusy}
    />
  ) : (
    <input
      type="file"
      onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
      className="col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
      disabled={proofBusy}
    />
  )}

  {editingProofId ? (
    <button
      type="button"
      onClick={() => patchProof(editingProofId)}
      disabled={proofBusy}
      className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
    >
      {proofBusy ? "…" : "Enregistrer"}
    </button>
  ) : (
    <button
      type="button"
      onClick={createProof}
      disabled={proofBusy}
      className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
    >
      {proofBusy ? "…" : "Ajouter"}
    </button>
  )}

                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">
                      DOCUMENT/FILE = URL vers un fichier (Drive/Notion/etc). LINK = lien simple.
                    </div>

                    {editingProofId ? (
                      <button
                        type="button"
                        onClick={cancelEditProof}
                        className="text-xs font-semibold text-slate-700 underline"
                        disabled={proofBusy}
                      >
                        Annuler la modification
                      </button>
                    ) : null}
                  </div>
                </div>

                {(data as any)?.proofs?.length === 0 ? (
                  <div className="text-sm text-slate-600">Aucune preuve.</div>
                ) : (
                  <div className="space-y-2">
                    {(data as any).proofs.map((p: any) => {
                      const lbl = getProofLabel(p) || "—";
                      return (
                        <div
                          key={p.id}
                          className="rounded-xl border border-slate-200 p-3 flex items-start justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-500">{p.type}</div>
                            <div className="font-semibold truncate">{lbl}</div>
                            <a
                              href={p.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-slate-700 underline break-all"
                            >
                              {p.url}
                            </a>
                            <div className="mt-1 text-xs text-slate-500">
                              Ajouté : {prettyDate(p.createdAt)}{" "}
                              {p.createdBy ? `• par ${p.createdBy}` : ""}
                              {p.auditId ? ` • audit ${shortId(p.auditId)}` : ""}
                            </div>
                          </div>

                          <div className="shrink-0 flex flex-col gap-2">
                            <button
                              type="button"
                              disabled={proofBusy}
                              onClick={() => {
                                setEditingProofId(p.id);
                                setProofType((String(p.type || "LINK").toUpperCase() as ProofType) ?? "LINK");
                                setProofLabel(getProofLabel(p));
                                setProofUrl(String(p.url || ""));
                                setError(null);
                              }}
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
                            >
                              Modifier
                            </button>

                            <button
                              type="button"
                              disabled={proofBusy}
                              onClick={() => deleteProof(p.id)}
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
                <div className="text-xs font-semibold text-slate-500">Historique</div>

                {mergedHistory.length === 0 ? (
                  <div className="text-sm text-slate-600">Aucun événement.</div>
                ) : (
                  <div className="space-y-2">
                    {mergedHistory.map((h: any) => {
                      const meta = getHistoryMeta(h);

                      const subtitle =
                        h.type === "PROOF_UPDATED"
                          ? (() => {
                              const from = meta?.from;
                              const to = meta?.to;
                              const fromLabel = from?.label ?? "—";
                              const toLabel = to?.label ?? "—";
                              return `De "${fromLabel}" → "${toLabel}"`;
                            })()
                          : null;

                      const auditLine =
                        h.type === "PROOF_UPDATED"
                          ? (() => {
                              const aid = meta?.linkedAuditId ?? null;
                              const aat = meta?.linkedAuditAt ?? null;
                              if (!aid && !aat) return null;
                              return `Audit lié : ${aid ? shortId(aid) : "—"}${aat ? ` • ${prettyDate(aat)}` : ""}`;
                            })()
                          : null;

                      const hashLine =
                        h.type === "PROOF_UPDATED"
                          ? (() => {
                              const hash = meta?.integrity?.hash ?? null;
                              if (!hash) return null;
                              return `Empreinte SHA-256 : ${String(hash).slice(0, 12)}…`;
                            })()
                          : null;

                      return (
                        <div key={h.id} className="rounded-xl border border-slate-200 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="text-sm font-semibold">
                              {h.type === "PROOF_UPDATED" ? "Preuve modifiée" : h.message}
                            </div>
                            <div className="text-xs text-slate-500 whitespace-nowrap">
                              {prettyDate(h.createdAt)}
                            </div>
                          </div>

                          {subtitle ? (
                            <div className="mt-1 text-xs text-slate-700">{subtitle}</div>
                          ) : null}

                          {auditLine ? (
                            <div className="mt-1 text-xs text-slate-500">{auditLine}</div>
                          ) : null}

                          {hashLine ? (
                            <div className="mt-1 text-xs text-slate-500">{hashLine}</div>
                          ) : null}

                          <div className="mt-1 text-xs text-slate-500">
                            {h.type} {normNullableString(h.createdBy) ? `• ${h.createdBy}` : ""}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        <div className="p-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            ID obligation state : <span className="font-semibold">{stateId}</span>
          </div>

          <button
            type="button"
            onClick={refresh}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Rafraîchir
          </button>
        </div>
      </div>
    </div>
  );
}