"use client";

import { useEffect, useMemo, useState } from "react";

/* ======================
   TYPES
====================== */

type AuditRow = {
  id: string;
  createdAt: string;
  industrySector?: string | null;
  useCaseType?: string | null;
  result?: any;
};

type ObligationRow = {
  id: string; // stateId (UseCaseObligationState.id)
  obligationId: string;
  status: string;
  priority: string;
  owner?: string | null;
  dueDate?: string | null;
  notes?: string | null;
};

type ProofDTO = {
  id: string;
  type: "FILE" | "LINK";
  name: string;
  url: string;
  createdAt: string;
  createdBy?: string | null;
  deletedAt?: string | null;
};

type HistoryDTO = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  createdBy?: string | null;
  meta?: any;
};

type DrawerData = {
  useCase: {
    id: string;
    key: string;
    title: string;
    sector: string;
  };
  obligation: {
    id: string;
    title: string;
    description?: string | null;
    legalRef?: string | null;
  };
  state: {
    id: string;
    obligationId: string;
    status: string;
    priority: string;
    owner?: string | null;
    dueDate?: string | null;
    notes?: string | null;
    lastAuditId?: string | null;
    lastAuditAt?: string | null;
    createdAt: string;
    updatedAt: string;
  };
  proofs: ProofDTO[];
  history: HistoryDTO[];
};

/* ======================
   UTILS
====================== */

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function slugify(v: string) {
  return (v || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildUseCaseKey(sector: string, title: string) {
  const s = slugify(sector || "non-classe");
  const t = slugify(title || "cas-d-usage");
  return `${s}__${t}`;
}

/* ======================
   COMPONENT
====================== */

export default function ComplianceClient() {
  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [useCaseKey, setUseCaseKey] = useState<string>("");
  const [obligations, setObligations] = useState<ObligationRow[]>([]);

  const [drawer, setDrawer] = useState<DrawerData | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerError, setDrawerError] = useState<string | null>(null);

  // Edition state (owner/dueDate/notes)
  const [editOwner, setEditOwner] = useState<string>("");
  const [editDueDate, setEditDueDate] = useState<string>(""); // format yyyy-mm-dd
  const [editNotes, setEditNotes] = useState<string>("");

  const [savingState, setSavingState] = useState(false);
  const [stateMsg, setStateMsg] = useState<string | null>(null);

  // Add proof
  const [proofType, setProofType] = useState<"FILE" | "LINK">("LINK");
  const [proofName, setProofName] = useState<string>("");
  const [proofUrl, setProofUrl] = useState<string>("");

  const [savingProof, setSavingProof] = useState(false);
  const [proofMsg, setProofMsg] = useState<string | null>(null);

  /* ======================
     LOAD AUDITS
  ====================== */

  useEffect(() => {
    let alive = true;

    async function loadAudits() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/audit?limit=50", { method: "GET" });
        const text = await res.text();
        const json = text ? JSON.parse(text) : null;

        if (!res.ok || !json || json.ok !== true) {
          throw new Error(json?.error || `Erreur API audits (${res.status})`);
        }

        if (!alive) return;

        const list = Array.isArray(json.audits) ? json.audits : [];
        setAudits(list);

        // auto useCaseKey (dernier audit)
        const last = list[0];
        const sector = String(last?.industrySector || "");
        const title = String(last?.useCaseType || "");
        const k = buildUseCaseKey(sector, title);
        setUseCaseKey(k);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Erreur chargement audits");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    loadAudits();
    return () => {
      alive = false;
    };
  }, []);

  /* ======================
     LOAD OBLIGATIONS (by useCaseKey)
  ====================== */

  useEffect(() => {
    let alive = true;

    async function loadObligations() {
      if (!useCaseKey) return;
      try {
        const res = await fetch(`/api/obligations?useCaseKey=${encodeURIComponent(useCaseKey)}`, { method: "GET" });
        const text = await res.text();
        const json = text ? JSON.parse(text) : null;

        if (!res.ok || !json || json.ok !== true) {
          throw new Error(json?.error || `Erreur API obligations (${res.status})`);
        }

        if (!alive) return;
        setObligations(Array.isArray(json.obligations) ? json.obligations : []);
      } catch (e: any) {
        if (!alive) return;
        // on n’écrase pas l’erreur globale, on affiche juste une liste vide
        setObligations([]);
      }
    }

    loadObligations();
    return () => {
      alive = false;
    };
  }, [useCaseKey]);

  /* ======================
     DRAWER helpers
  ====================== */

  function hydrateEditFields(d: DrawerData) {
    setEditOwner(String(d.state.owner ?? ""));
    setEditNotes(String(d.state.notes ?? ""));

    // input type="date" attend yyyy-mm-dd
    if (d.state.dueDate) {
      try {
        const dt = new Date(d.state.dueDate);
        const yyyy = dt.getFullYear();
        const mm = String(dt.getMonth() + 1).padStart(2, "0");
        const dd = String(dt.getDate()).padStart(2, "0");
        setEditDueDate(`${yyyy}-${mm}-${dd}`);
      } catch {
        setEditDueDate("");
      }
    } else {
      setEditDueDate("");
    }

    setStateMsg(null);
    setProofMsg(null);
    setProofType("LINK");
    setProofName("");
    setProofUrl("");
  }

  async function loadDrawer(stateId: string) {
    setDrawerLoading(true);
    setDrawerError(null);

    try {
      const res = await fetch(`/api/obligations/${encodeURIComponent(stateId)}`, { method: "GET" });
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;

      if (!res.ok || !json) {
        throw new Error(json?.error || `Erreur drawer (${res.status})`);
      }

      setDrawer(json as DrawerData);
      hydrateEditFields(json as DrawerData);
    } catch (e: any) {
      setDrawerError(e?.message || "Erreur ouverture drawer");
    } finally {
      setDrawerLoading(false);
    }
  }

  async function refreshDrawer() {
    if (!drawer?.state?.id) return;
    await loadDrawer(drawer.state.id);
  }

  /* ======================
     ACTIONS: PATCH state
  ====================== */

  async function saveState() {
    if (!drawer) return;

    setSavingState(true);
    setStateMsg(null);

    try {
      const payload: any = {};

      // owner (nullable)
      const ownerTrim = editOwner.trim();
      payload.owner = ownerTrim.length === 0 ? null : ownerTrim;

      // notes (nullable)
      const notesTrim = editNotes.trim();
      payload.notes = notesTrim.length === 0 ? null : notesTrim;

      // dueDate (nullable) -> on envoie ISO string (API attend string)
      if (editDueDate.trim().length === 0) {
        payload.dueDate = null;
      } else {
        // on transforme yyyy-mm-dd -> ISO
        const iso = new Date(`${editDueDate}T00:00:00.000Z`).toISOString();
        payload.dueDate = iso;
      }

      const res = await fetch(`/api/obligations/${encodeURIComponent(drawer.state.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      const json = text ? JSON.parse(text) : null;

      if (!res.ok || !json) {
        throw new Error(json?.error || `Erreur PATCH (${res.status})`);
      }

      setDrawer(json as DrawerData);
      hydrateEditFields(json as DrawerData);
      setStateMsg("✅ Enregistré");
    } catch (e: any) {
      setStateMsg(`❌ ${e?.message || "Erreur enregistrement"}`);
    } finally {
      setSavingState(false);
    }
  }

  /* ======================
     ACTIONS: PROOFS
  ====================== */

 async function addProof() {
  if (!drawer) return;

  setSavingProof(true);
  setProofMsg(null);

  try {
    const nameTrim = proofName.trim();
    const urlTrim = proofUrl.trim();

    if (!nameTrim || !urlTrim) {
      setProofMsg("❌ Il faut un nom et une URL");
      return;
    }

    const payload = {
      type: proofType,
      name: nameTrim,
      url: urlTrim,
    };

    const res = await fetch(`/api/obligations/${encodeURIComponent(drawer.state.id)}/proofs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    const json = text ? JSON.parse(text) : null;

    if (!res.ok || !json || json.ok !== true) {
      throw new Error(json?.error || `Erreur ajout preuve (${res.status})`);
    }

    setProofMsg("✅ Preuve ajoutée");
    setProofName("");
    setProofUrl("");
    await refreshDrawer();
  } catch (e: any) {
    setProofMsg(`❌ ${e?.message || "Erreur ajout preuve"}`);
  } finally {
    setSavingProof(false);
  }
}

  async function removeProof(proofId: string) {
    if (!drawer) return;
    const ok = confirm("Supprimer cette preuve ?");
    if (!ok) return;

    setSavingProof(true);
    setProofMsg(null);

    try {
      const res = await fetch(
        `/api/obligations/${encodeURIComponent(drawer.state.id)}/proofs/${encodeURIComponent(proofId)}`,
        { method: "DELETE" }
      );

      const text = await res.text();
      const json = text ? JSON.parse(text) : null;

      if (!res.ok || !json || json.ok !== true) {
        throw new Error(json?.error || `Erreur suppression preuve (${res.status})`);
      }

      setProofMsg("✅ Preuve supprimée");
      await refreshDrawer();
    } catch (e: any) {
      setProofMsg(`❌ ${e?.message || "Erreur suppression preuve"}`);
    } finally {
      setSavingProof(false);
    }
  }

  /* ======================
     RENDER
  ====================== */

  if (loading) return <div className="p-8 text-slate-700">Chargement…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Suivi de conformité — registre vivant</h1>
        <p className="mt-1 text-sm text-slate-600">
          Ici, tu gères les obligations (owner / deadline / notes / preuves) + l’historique.
        </p>
      </div>

      {/* UseCaseKey selector (simple) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold text-slate-500 mb-2">Cas d’usage (useCaseKey)</div>
        <div className="flex gap-2 flex-wrap items-center">
          <input
            className="w-full sm:w-[520px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={useCaseKey}
            onChange={(e) => setUseCaseKey(e.target.value)}
            placeholder="ex: employment__trie-de-cv"
          />
          <button
            type="button"
            onClick={() => {
              // reload obligations by changing state (useEffect handles)
              setUseCaseKey((v) => v.trim());
            }}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Charger
          </button>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Astuce : la valeur doit ressembler à <span className="font-semibold">secteur__titre-slug</span>.
        </div>
      </div>

      {/* Obligations list */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-3 font-semibold">
          Obligations ({obligations.length})
        </div>

        {obligations.length === 0 ? (
          <div className="p-4 text-slate-500">Aucune obligation trouvée pour ce useCaseKey.</div>
        ) : (
          <div className="divide-y">
            {obligations.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => loadDrawer(o.id)}
                className="w-full text-left px-4 py-3 hover:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{o.obligationId}</div>
                    <div className="mt-1 text-xs text-slate-600">
                      {o.owner ? `Owner: ${o.owner}` : "Owner: —"}
                      {o.dueDate ? ` • Deadline: ${formatDate(o.dueDate)}` : " • Deadline: —"}
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-slate-700">
                    {o.status} • {o.priority}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Drawer */}
      {drawer ? (
        <div className="fixed inset-0 z-50 bg-black/30 flex justify-end">
          <div className="w-full max-w-xl bg-white h-full overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-slate-500 font-semibold">Détail obligation</div>
                <div className="mt-1 text-lg font-bold truncate">{drawer.obligation.title}</div>
                <div className="mt-1 text-sm text-slate-600">
                  {drawer.useCase.title} • {drawer.useCase.sector}
                </div>
              </div>

              <button
                type="button"
                className="text-sm font-semibold text-slate-700 hover:underline"
                onClick={() => setDrawer(null)}
              >
                Fermer
              </button>
            </div>

            {drawerLoading ? (
              <div className="p-6 text-slate-600">Chargement…</div>
            ) : drawerError ? (
              <div className="p-6 text-red-600">{drawerError}</div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Read-only */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs font-semibold text-slate-500">Status</div>
                      <div className="font-bold">{drawer.state.status}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500">Priorité</div>
                      <div className="font-bold">{drawer.state.priority}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500">Dernière maj</div>
                      <div className="text-slate-700">{formatDate(drawer.state.updatedAt)}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500">Audit lié</div>
                      <div className="text-slate-700">{drawer.state.lastAuditId ? drawer.state.lastAuditId : "—"}</div>
                    </div>
                  </div>
                </div>

                {/* EDIT state */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="font-semibold">Édition (registre vivant)</div>

                  <div className="mt-3 space-y-3">
                    <div>
                      <div className="text-xs font-semibold text-slate-500 mb-1">Owner</div>
                      <input
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        value={editOwner}
                        onChange={(e) => setEditOwner(e.target.value)}
                        placeholder="ex: Legal / DPO / Alban…"
                      />
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-slate-500 mb-1">Deadline</div>
                      <input
                        type="date"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                      />
                      <div className="mt-1 text-xs text-slate-500">
                        Vide = pas de deadline.
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-slate-500 mb-1">Notes</div>
                      <textarea
                        className="w-full min-h-[90px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="ex: Politique en cours, doc à valider, etc."
                      />
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        type="button"
                        onClick={saveState}
                        disabled={savingState}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                      >
                        {savingState ? "Enregistrement…" : "Enregistrer"}
                      </button>

                      {stateMsg ? (
                        <div className="text-sm text-slate-700">{stateMsg}</div>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* PROOFS */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="font-semibold">Preuves</div>

                  {/* Add proof */}
                  <div className="mt-3 grid gap-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <div className="text-xs font-semibold text-slate-500 mb-1">Type</div>
                        <select
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          value={proofType}
                          onChange={(e) => setProofType(e.target.value as any)}
                        >
                          <option value="LINK">LINK</option>
                          <option value="FILE">FILE</option>
                        </select>
                      </div>

                      <div className="col-span-2">
                        <div className="text-xs font-semibold text-slate-500 mb-1">Nom</div>
                        <input
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          value={proofName}
                          onChange={(e) => setProofName(e.target.value)}
                          placeholder="ex: Politique de gestion des données v1"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-slate-500 mb-1">URL</div>
                      <input
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        value={proofUrl}
                        onChange={(e) => setProofUrl(e.target.value)}
                        placeholder="https://…"
                      />
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        type="button"
                        onClick={addProof}
                        disabled={savingProof}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                      >
                        {savingProof ? "Ajout…" : "Ajouter une preuve"}
                      </button>

                      {proofMsg ? (
                        <div className="text-sm text-slate-700">{proofMsg}</div>
                      ) : null}
                    </div>
                  </div>

                  {/* List proofs */}
                  <div className="mt-4 space-y-2">
                    {drawer.proofs.length === 0 ? (
                      <div className="text-sm text-slate-500">Aucune preuve.</div>
                    ) : (
                      drawer.proofs.map((p) => (
                        <div
                          key={p.id}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-start justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-500">
                              {p.type} • ajouté le {formatDate(p.createdAt)} {p.createdBy ? `• par ${p.createdBy}` : ""}
                            </div>
                            <div className="mt-1 font-semibold truncate">{p.name}</div>
                            <a
                              className="mt-1 block text-xs text-slate-700 underline break-all"
                              href={p.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {p.url}
                            </a>
                            <div className="mt-1 text-[11px] text-slate-500">
                              Proof ID: <span className="font-mono">{p.id}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeProof(p.id)}
                            disabled={savingProof}
                            className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-100 disabled:opacity-60"
                          >
                            Supprimer
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* HISTORY */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="font-semibold">Historique</div>
                  <div className="mt-3 space-y-2">
                    {drawer.history.length === 0 ? (
                      <div className="text-sm text-slate-500">Aucun évènement.</div>
                    ) : (
                      drawer.history.map((h) => (
                        <div key={h.id} className="rounded-xl border border-slate-200 bg-white p-3">
                          <div className="text-xs text-slate-500 font-semibold">
                            {h.type} • {formatDate(h.createdAt)} {h.createdBy ? `• ${h.createdBy}` : ""}
                          </div>
                          <div className="mt-1 text-sm text-slate-900">{h.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pb-10" />
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
