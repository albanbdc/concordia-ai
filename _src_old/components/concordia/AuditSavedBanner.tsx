"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuditSavedBanner({
  auditId,
}: {
  auditId: string | null;
}) {
  if (!auditId) return null;

  return (
    <div className="border rounded-lg bg-green-50 border-green-200 p-3 text-sm flex items-center justify-between gap-3">
      <div>
        <p className="font-medium text-green-900">Audit enregistré ✅</p>
        <p className="text-xs text-green-800">
          ID : <span className="font-mono">{auditId}</span>
        </p>
      </div>

      <Button asChild size="sm">
        <Link href={`/dashboard/audits/${auditId}`}>Voir l’audit</Link>
      </Button>
    </div>
  );
}
