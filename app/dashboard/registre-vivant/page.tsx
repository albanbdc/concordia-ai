import { Suspense } from "react";
import RegistreVivantClient from "./RegistreVivantClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8">Chargement…</div>}>
      <RegistreVivantClient />
    </Suspense>
  );
}