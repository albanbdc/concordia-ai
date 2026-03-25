import { Suspense } from "react";
import ComplianceClient from "./ComplianceClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8">Chargement…</div>}>
      <ComplianceClient />
    </Suspense>
  );
}
