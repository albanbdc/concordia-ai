"use client";

type ChartsProps = {
  conformities: {
    labels: string[];
    values: number[];
  };
  sectors: {
    labels: string[];
    values: number[];
  };
  useCases: {
    labels: string[];
    values: number[];
  };
};

function HorizontalBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const pct = max === 0 ? 0 : Math.round((value * 100) / max);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] text-slate-600">
        <span className="truncate max-w-[60%]" title={label}>
          {label}
        </span>
        <span>
          {value} ({pct}%)
        </span>
      </div>
      <div className="w-full h-2 rounded bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded bg-blue-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function DashboardCharts({
  conformities,
  sectors,
  useCases,
}: ChartsProps) {
  const maxSector =
    sectors.values.length > 0
      ? Math.max(...sectors.values)
      : 0;
  const maxUseCase =
    useCases.values.length > 0
      ? Math.max(...useCases.values)
      : 0;

  const totalConformities = conformities.values.reduce(
    (sum, v) => sum + v,
    0
  );

  return (
    <section className="grid gap-6 md:grid-cols-3 mt-4">
      {/* Carte 1 : répartition conformité */}
      <div className="border rounded-md p-4 bg-white shadow-sm col-span-1">
        <h2 className="text-sm font-semibold mb-3">
          Répartition des niveaux de conformité
        </h2>
        {totalConformities === 0 ? (
          <p className="text-xs text-slate-500">
            Les indicateurs s&apos;afficheront dès que des audits auront
            été réalisés.
          </p>
        ) : (
          <div className="space-y-2 text-xs">
            {conformities.labels.map((label, idx) => {
              const value = conformities.values[idx] || 0;
              const pct =
                totalConformities === 0
                  ? 0
                  : Math.round(
                      (value * 100) / totalConformities
                    );

              const color =
                label === "Non conforme"
                  ? "bg-red-500"
                  : label === "Conforme sous conditions"
                  ? "bg-amber-500"
                  : "bg-emerald-500";

              return (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>{label}</span>
                    <span>
                      {value} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded ${color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Carte 2 : Secteurs */}
      <div className="border rounded-md p-4 bg-white shadow-sm col-span-1">
        <h2 className="text-sm font-semibold mb-3">
          Secteurs les plus audités
        </h2>
        {sectors.labels.length === 0 ? (
          <p className="text-xs text-slate-500">
            Les secteurs apparaîtront au fur et à mesure des audits
            réalisés.
          </p>
        ) : (
          <div className="space-y-2 text-xs">
            {sectors.labels.map((label, idx) => (
              <HorizontalBar
                key={label}
                label={label}
                value={sectors.values[idx] || 0}
                max={maxSector}
              />
            ))}
          </div>
        )}
      </div>

      {/* Carte 3 : Types d’usage */}
      <div className="border rounded-md p-4 bg-white shadow-sm col-span-1">
        <h2 className="text-sm font-semibold mb-3">
          Types d&apos;usage IA les plus fréquents
        </h2>
        {useCases.labels.length === 0 ? (
          <p className="text-xs text-slate-500">
            Les types d&apos;usage apparaîtront au fur et à mesure des
            audits réalisés.
          </p>
        ) : (
          <div className="space-y-2 text-xs">
            {useCases.labels.map((label, idx) => (
              <HorizontalBar
                key={label}
                label={label}
                value={useCases.values[idx] || 0}
                max={maxUseCase}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
