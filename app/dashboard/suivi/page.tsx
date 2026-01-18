// app/dashboard/suivi/page.tsx
import { Suspense } from "react";
import SuiviClient from "./SuiviClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-600">Chargement du suivi…</div>}>
      <SuiviClient />
    </Suspense>
  );
}
