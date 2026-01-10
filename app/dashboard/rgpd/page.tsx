export default function RgpdPage() {
  return (
    <main className="max-w-4xl mx-auto py-10 space-y-8">
      {/* Titre */}
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold">RGPD – Comprendre les enjeux</h1>
        <p className="text-sm text-muted-foreground">
          Le Règlement Général sur la Protection des Données (RGPD) encadre l&apos;utilisation des données personnelles en Europe.
          Toute IA utilisant directement ou indirectement des données personnelles est concernée par ce cadre légal.
        </p>
      </section>

      {/* 1. C’est quoi le RGPD ? */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-1">
          1 – C&apos;est quoi le RGPD ?
        </h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          Le RGPD est le texte européen de référence pour protéger les données personnelles. Il vise à garantir que toute
          organisation qui collecte, traite ou stocke des données respecte des principes fondamentaux : transparence,
          sécurité, minimisation et contrôle par les personnes concernées.
        </p>
        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
          <li>Il s&apos;applique à toutes les organisations, publiques et privées.</li>
          <li>Il couvre tout traitement automatisé ou manuel de données personnelles.</li>
          <li>Il impose des obligations en matière de sécurité, transparence et documentation.</li>
        </ul>
      </section>

      {/* 2. Pourquoi le RGPD s’applique à l’IA ? */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-1">
          2 – Pourquoi l&apos;IA est particulièrement concernée ?
        </h2>
        <p className="text-sm text-slate-700">
          La grande majorité des systèmes IA traitent des données personnelles : texte, images, comportements, historiques,
          contenus générés… Le RGPD s&apos;applique donc à chaque étape du cycle de vie d&apos;un système IA :
        </p>
        <ul className="text-sm text-slate-700 list-disc list-inside space-y-1">
          <li>Collecte des données (CV, logs, images, emails…)</li>
          <li>Entraînement du modèle</li>
          <li>Inférence (décisions prises par l&apos;IA)</li>
          <li>Stockage et réutilisation des données</li>
        </ul>
      </section>

      {/* 3. Obligations RGPD clés */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-1">
          3 – Les obligations clés à respecter
        </h2>

        <div className="space-y-3">
          <div className="border rounded-md p-3 bg-slate-50">
            <h3 className="text-sm font-semibold text-blue-700">3.1 – Minimisation des données</h3>
            <p className="text-sm text-slate-700 mt-1">
              Une IA ne doit utiliser que les données strictement nécessaires à son fonctionnement. 
              Les informations excessives ou sensibles doivent être évitées.
            </p>
          </div>

          <div className="border rounded-md p-3 bg-blue-50">
            <h3 className="text-sm font-semibold text-blue-700">3.2 – Transparence et information</h3>
            <p className="text-sm text-slate-700 mt-1">
              Les personnes doivent être informées si une IA analyse leurs données ou prend une décision les concernant.
              Les finalités doivent être claires, légitimes et compréhensibles.
            </p>
          </div>

          <div className="border rounded-md p-3 bg-amber-50">
            <h3 className="text-sm font-semibold text-amber-700">3.3 – Base légale du traitement</h3>
            <p className="text-sm text-slate-700 mt-1">
              Chaque traitement IA doit reposer sur une base légale : consentement, contrat, obligation légale,
              intérêt légitime, mission de service public…
            </p>
          </div>

          <div className="border rounded-md p-3 bg-emerald-50">
            <h3 className="text-sm font-semibold text-emerald-700">3.4 – Sécurité et confidentialité</h3>
            <p className="text-sm text-slate-700 mt-1">
              L&apos;organisation doit démontrer que les données sont protégées : chiffrement, contrôle d&apos;accès,
              audit des accès, tests réguliers.
            </p>
          </div>

          <div className="border rounded-md p-3 bg-purple-50">
            <h3 className="text-sm font-semibold text-purple-700">3.5 – DPIA / Analyse d&apos;impact</h3>
            <p className="text-sm text-slate-700 mt-1">
              Pour une IA à risque (RH, finance, santé, surveillance…), une Analyse d&apos;Impact relative à la Protection des Données (AIPD)
              est souvent obligatoire afin d&apos;évaluer les risques et définir les mesures de protection.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Droits des personnes */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-1">
          4 – Les droits des personnes concernées
        </h2>
        <p className="text-sm text-slate-700">
          Lorsqu&apos;une IA prend une décision ou influence un traitement, les personnes disposent de droits renforcés :
        </p>
        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
          <li>Droit d&apos;accès</li>
          <li>Droit d&apos;opposition</li>
          <li>Droit de rectification</li>
          <li>Droit d&apos;effacement</li>
          <li>Droit à l&apos;explication des décisions automatisées</li>
        </ul>
        <p className="text-xs text-muted-foreground">
          Une IA opaque (“boîte noire”) peut rendre ces obligations très difficiles à respecter.
        </p>
      </section>

      {/* 5. Sanctions RGPD */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-1">
          5 – Sanctions prévues par le RGPD
        </h2>

        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
          <li>
            Jusqu&apos;à <span className="font-medium">20 millions d&apos;euros</span> ou 
            <span className="font-medium"> 4% du chiffre d&apos;affaires mondial</span>.
          </li>
          <li>Sanctions administratives graduées selon la gravité.</li>
          <li>Suspension des traitements non conformes.</li>
          <li>Alerte publique par la CNIL (effet réputationnel).</li>
        </ul>

        <p className="text-xs text-muted-foreground">
          Pour les systèmes IA, les sanctions RGPD peuvent se cumuler avec celles de l&apos;AI Act.
        </p>
      </section>

      {/* 6. Ressources officielles */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-1">
          6 – Ressources officielles RGPD
        </h2>

        <ul className="text-sm space-y-2">
          <li>
            <a
              href="https://www.cnil.fr/fr/reglement-europeen-protection-des-donnees"
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              🔗 CNIL – Page officielle RGPD
            </a>
          </li>

          <li>
            <a
              href="https://eur-lex.europa.eu/eli/reg/2016/679/oj"
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              🔗 Texte complet du RGPD (EUR-Lex)
            </a>
          </li>

          <li>
            <a
              href="https://edpb.europa.eu/"
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              🔗 EDPB – Lignes directrices (Comité européen de la protection des données)
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
