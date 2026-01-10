"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  auditId: string;
};

export default function GenerateActionButton({ auditId }: Props) {
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    setInfo(null);

    try {
      const res = await fetch("/api/actions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditId }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Erreur lors de la génération.");
      }

      if (typeof data.created === "number") {
        if (data.created === 0) {
          setInfo("Aucune nouvelle action détectée pour cet audit.");
        } else {
          setInfo(
            `${data.created} action(s) de conformité générée(s) avec succès.`
          );
        }
      } else {
        setInfo("Plan d’action généré avec succès.");
      }

      // Rafraîchit la page pour recharger les actions
      router.refresh();
    } catch (e) {
      console.error(e);
      setInfo(
        "Erreur lors de la génération du plan d’action. Merci de réessayer."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={loading}
      >
        {loading
          ? "Génération du plan d’action…"
          : "Générer le plan d’actions de conformité"}
      </Button>

      {info && <p className="text-xs text-slate-500 max-w-md">{info}</p>}
    </div>
  );
}
