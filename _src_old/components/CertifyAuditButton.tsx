"use client";

import { useState } from "react";

type CertifyAuditButtonProps = {
  auditId: string;
  initialCertified: boolean;
  initialCertifiedAt?: string | null;
};

export default function CertifyAuditButton({
  auditId,
  initialCertified,
  initialCertifiedAt,
}: CertifyAuditButtonProps) {
  const [certified, setCertified] = useState(initialCertified);
  const [certifiedAt, setCertifiedAt] = useState<string | null>(
    initialCertifiedAt ?? null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/audit/certify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de la certification.");
      }

      setCertified(true);
      setCertifiedAt(data.certifiedAt || null);
    } catch (e: any) {
      setError(e.message || "Erreur serveur.");
    } finally {
      setLoading(false);
    }
  };

  const label = certified
    ? "Audit certifié"
    : loading
    ? "Certification..."
    : "Certifier cet audit";

  return (
    <div className="flex flex-col gap-1 items-start">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="px-3 py-2 rounded text-sm bg-blue-600 text-white disabled:bg-slate-400"
      >
        {label}
      </button>
      {certifiedAt && (
        <p className="text-[11px] text-slate-500">
          Certifié le{" "}
          {new Date(certifiedAt).toLocaleString("fr-FR")}
        </p>
      )}
      {error && (
        <p className="text-[11px] text-red-600">{error}</p>
      )}
    </div>
  );
}
