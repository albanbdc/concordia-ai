import { Suspense } from "react";
import ReportClient from "./ReportClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8">Chargement du rapport…</div>}>
      <ReportClient />
    </Suspense>
  );
}
