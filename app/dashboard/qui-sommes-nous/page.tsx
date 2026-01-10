export default function QuiSommesNousPage() {
  return (
    <main className="max-w-4xl mx-auto py-10 space-y-8">
      {/* Titre + accroche */}
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold">Qui sommes-nous ?</h1>
        <p className="text-sm text-muted-foreground">
          Concordia est une plateforme SaaS dédiée à la maîtrise des risques liés à l&apos;intelligence artificielle.
          Notre rôle : aider les organisations à déployer l&apos;IA de manière fiable, documentée et conforme aux
          grandes régulations européennes (AI Act, RGPD), tout en protégeant leur responsabilité juridique.
        </p>
      </section>

      {/* Notre mission */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-1">1 – Notre mission</h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          La mission de Concordia est simple : donner aux entreprises un <span className="font-medium">
          outil clair et opérationnel</span> pour évaluer leurs systèmes IA, identifier les risques, prioriser les
          actions et constituer une base documentaire solide en cas de contrôle ou de litige.
        </p>
        <p className="text-sm text-slate-700">
          Nous voulons rendre la conformité IA <span className="font-medium">compréhensible, actionnable et prouvable</span>,
          sans transformer chaque projet IA en chantier juridique interminable.
        </p>
      </section>

      {/* Le constat */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-1">2 – Le constat sur le terrain</h2>
        <p className="text-sm text-slate-700">
          Dans la plupart des organisations, l&apos;IA se déploie plus vite que la capacité à la maîtriser :
        </p>
        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
          <li>Les équipes métiers lancent des POC, connectent des modèles, testent des outils GenAI.</li>
          <li>Les systèmes IA prennent des décisions ou influencent des décisions réelles (clients, patients, candidats…).</li>
          <li>Mais la vision globale des risques IA reste floue, fragmentée, parfois inexistante.</li>
          <li>La documentation est dispersée, incomplète ou rédigée a posteriori.</li>
          <li>Les impacts de l&apos;AI Act et du RGPD sont mal connus ou sous-estimés.</li>
        </ul>
        <p className="text-sm text-slate-700">
          Résultat : l&apos;entreprise progresse sur l&apos;IA, mais <span className="font-medium">sans garde-fous clairs</span>,
          et sans être capable de démontrer qu&apos;elle a mis en place une démarche sérieuse de maîtrise des risques.
        </p>
      </section>

      {/* Pourquoi Concordia */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-1">3 – Pourquoi Concordia ?</h2>
        <p className="text-sm text-slate-700">
          Concordia a été pensé comme un <span className="font-medium">pont entre la technique, le métier et le juridique</span>.
          L&apos;objectif est d&apos;offrir un langage commun à la DSI, aux équipes Data, aux métiers, aux Risk Managers,
          aux juristes et aux directions.
        </p>
        <p className="text-sm text-slate-700">Concrètement, Concordia permet de :</p>
        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
          <li><span className="font-medium">Auditer rapidement un système IA</span> à partir d&apos;une description métier.</li>
          <li><span className="font-medium">Identifier les risques</span> : biais, discrimination, opacité, dépendance modèle, RGPD, gouvernance…</li>
          <li><span className="font-medium">Qualifier le niveau de risque</span> en lien avec l&apos;AI Act (risque limité / haut risque / cas sensibles).</li>
          <li><span className="font-medium">Proposer un plan d&apos;action priorisé</span> plutôt qu&apos;une liste théorique de bonnes pratiques.</li>
          <li><span className="font-medium">Constituer une base documentaire</span> réutilisable en interne (comités IA, Risk, Compliance, DSI, Audit interne).</li>
        </ul>
      </section>

      {/* Notre approche : audit + protection juridique */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-1">
          4 – Un outil d&apos;audit, mais aussi une protection juridique
        </h2>
        <p className="text-sm text-slate-700">
          Concordia n&apos;est pas seulement un générateur de rapports : c&apos;est un <span className="font-medium">
          support de preuve</span> pour démontrer que l&apos;organisation a pris au sérieux la maîtrise de ses systèmes IA.
        </p>
        <p className="text-sm text-slate-700">
          À chaque audit, Concordia aide à :
        </p>
        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
          <li>Tracer les cas d&apos;usage IA analysés (secteur, usage, département interne).</li>
          <li>Documenter les risques identifiés et les points de vigilance.</li>
          <li>Rendre visible la classification AI Act et les enjeux RGPD associés.</li>
          <li>Structurer un plan d&apos;action concret et datable.</li>
        </ul>
        <p className="text-sm text-slate-700">
          En cas de contrôle, d&apos;audit externe ou de litige, cette documentation peut contribuer à démontrer
          la <span className="font-medium">diligence raisonnable</span> de l&apos;organisation : elle a cartographié ses systèmes IA,
          identifié les risques, arbitré des plans d&apos;action et suivi la situation dans le temps.
        </p>
      </section>

      {/* Nos principes */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-1">5 – Nos principes</h2>
        <p className="text-sm text-slate-700">
          Concordia repose sur quelques principes simples qui guident le produit :
        </p>
        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
          <li><span className="font-medium">Clarté</span> : un langage compréhensible par les équipes métiers comme par les juristes.</li>
          <li><span className="font-medium">Pragmatisme</span> : des recommandations concrètes, actionnables, hiérarchisées dans le temps.</li>
          <li><span className="font-medium">Traçabilité</span> : garder une mémoire des audits réalisés, des risques identifiés et des décisions prises.</li>
          <li><span className="font-medium">Évolutivité</span> : intégrer progressivement les évolutions de l&apos;AI Act, du RGPD et des bonnes pratiques.</li>
        </ul>
      </section>

      {/* Notre vision */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-1">6 – Notre vision</h2>
        <p className="text-sm text-slate-700">
          À mesure que l&apos;IA devient centrale dans les produits, les services et les décisions,
          les entreprises auront besoin de <span className="font-medium">gouverner</span> leurs systèmes IA autant que leurs systèmes financiers
          ou leur cybersécurité.
        </p>
        <p className="text-sm text-slate-700">
          Notre ambition est de faire de Concordia la plateforme de référence pour :
        </p>
        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
          <li>cartographier l&apos;ensemble des usages IA d&apos;une organisation ;</li>
          <li>suivre le niveau de risque et de conformité dans le temps ;</li>
          <li>faciliter le dialogue entre DSI, Data, métiers, Risk, Compliance et Direction ;</li>
          <li>fournir une base de preuve solide en cas de contrôle réglementaire.</li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Concordia n&apos;est pas là pour freiner l&apos;innovation IA, mais pour lui offrir un cadre robuste, assumé et défendable.
        </p>
      </section>
    </main>
  );
}
