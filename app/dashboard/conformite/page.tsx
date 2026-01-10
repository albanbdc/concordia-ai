export default function CompliancePlaceholder() {
  return (
    <main className="max-w-4xl mx-auto py-10 space-y-4">
      <h1 className="text-2xl font-semibold">Suivi de mise en conformité</h1>

      <p className="text-sm text-slate-600">
        Cette section affichera bientôt le suivi automatique des obligations
        IA Act, le statut des actions correctives et les risques résiduels.
        Pour l&apos;instant, elle est désactivée pour se concentrer sur le
        développement du moteur d&apos;audit principal.
      </p>

      <div className="p-4 border rounded-md bg-white shadow-sm">
        <p className="text-sm text-slate-700">
          👉 Le module de suivi n&apos;est pas encore disponible.
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Il sera activé une fois le générateur PDF et les obligations IA Act
          finalisées.
        </p>
      </div>
    </main>
  );
}
