"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  payload: any;
};

export default function ResumeAuditButton({ payload }: Props) {
  const router = useRouter();

  function handleResume() {
    if (!payload) return;

    // On remet le payload dans le sessionStorage
    sessionStorage.setItem(
      "concordia:lastAuditSystem",
      JSON.stringify(payload.system ?? payload)
    );

    if (payload.fulfillments) {
      sessionStorage.setItem(
        "concordia:lastAuditFulfillments",
        JSON.stringify(payload.fulfillments)
      );
    }

    if (payload.preMeasures) {
      sessionStorage.setItem(
        "concordia:lastAuditPreMeasures",
        JSON.stringify(payload.preMeasures)
      );
    }

    router.push("/dashboard/audit");
  }

  return (
    <Button variant="outline" size="sm" onClick={handleResume}>
      Reprendre cet audit
    </Button>
  );
}
