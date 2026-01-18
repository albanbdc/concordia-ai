// app/dashboard/compliance/page.tsx
import { Suspense } from "react";
import ComplianceClient from "./ComplianceClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-600">Chargement…</div>}>
      <ComplianceClient />
    </Suspense>
  );
}
