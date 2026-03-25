// app/dashboard/usecases/[key]/page.tsx
export const dynamic = "force-dynamic";

import UseCaseHistoryClient from "./UseCaseHistoryClient";

export default async function Page({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  return <UseCaseHistoryClient useCaseKey={key} />;
}