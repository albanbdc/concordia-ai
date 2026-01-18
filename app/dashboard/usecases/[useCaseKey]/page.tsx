// app/dashboard/usecases/[useCaseKey]/page.tsx
export const dynamic = "force-dynamic";

import UseCaseHistoryClient from "./UseCaseHistoryClient";

export default async function Page({ params }: { params: Promise<{ useCaseKey: string }> }) {
  const { useCaseKey } = await params;
  return <UseCaseHistoryClient useCaseKey={useCaseKey} />;
}