// app/dashboard/obligations/page.tsx
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import ObligationsClient from "./ObligationsClient";

export default function Page() {
  return <ObligationsClient />;
}
