export default function AiActPage() {
  return (
    <main className="max-w-4xl mx-auto py-10 space-y-8">
      {/* Titre + intro */}
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold">AI Act – Comprendre l&apos;enjeu</h1>
        <p className="text-sm text-muted-foreground">
          L&apos;AI Act est le futur règlement européen qui encadre l&apos;usage des systèmes d&apos;intelligence artificielle.
          Son objectif : permettre aux organisations d&apos;exploiter l&apos;IA tout en maîtrisant les risques juridiques, éthiques et opérationnels.
        </p>
      </section>

      {/* Bloc 1 – C’est quoi l’AI Act ? */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-1">
          1 – C&apos;est quoi l&apos;AI Act ?
        </h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          L&apos;AI Act est un règlement européen qui établit un cadre commun pour les systèmes d&apos;IA déployés dans l&apos;Union européenne.
          Il ne vise pas à interdire l&apos;IA, mais à s&apos;assurer qu&apos;elle soit utilisée de façon sûre, transparente et sous contrôle humain,
          surtout lorsqu&apos;elle impacte directement les droits des individus (crédit, recrutement, santé, sécurité, etc.).
        </p>
        <ul className="text-sm text-slate-700 list-disc list-inside space-y-1">
          <li>Il s&apos;applique aux fournisseurs de solutions IA, mais aussi aux entreprises qui les intègrent ou les utilisent.</li>
          <li>Il introduit des obligations renforcées pour les systèmes dits &laquo; à haut risque &raquo;.</li>
          <li>Il complète les autres textes (RGPD, droit de la consommation, réglementation sectorielle, etc.).</li>
        </ul>
      </section>

      {/* Bloc 2 – Classification des risques */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-1">
          2 – Comment l&apos;AI Act classe les systèmes d&apos;IA ?
        </h2>
        <p className="text-sm text-slate-700">
          L&apos;AI Act ne traite pas tous les systèmes d&apos;IA de la même manière. Il introduit une classification par niveau de risque :
        </p>

        <div className="space-y-3">
          <div className="border rounded-md p-3 bg-slate-50">
            <h3 className="text-sm font-semibold text-red-700">
              2.1 – Risque inacceptable (interdit)
            </h3>
            <p className="text-sm text-slate-700 mt-1">
              Ce sont les usages jugés incompatibles avec les valeurs européennes : score social généralisé,
              manipulation comportementale de personnes vulnérables, certains usages de la reconnaissance biométrique
              en temps réel dans l&apos;espace public, etc. Ces systèmes sont purement interdits.
            </p>
          </div>

          <div className="border rounded-md p-3 bg-amber-50">
            <h3 className="text-sm font-semibold text-amber-700">
              2.2 – Systèmes à haut risque
            </h3>
            <p className="text-sm text-slate-700 mt-1">
              Ce sont les systèmes d&apos;IA utilisés dans des domaines sensibles : santé, finance, recrutement,
              éducation, justice, sécurité, infrastructures critiques, etc. Ils restent autorisés, mais soumis à des
              exigences très strictes en matière de gestion des risques, qualité des données, gouvernance et supervision humaine.
            </p>
          </div>

          <div className="border rounded-md p-3 bg-blue-50">
            <h3 className="text-sm font-semibold text-blue-700">
              2.3 – Risque limité
            </h3>
            <p className="text-sm text-slate-700 mt-1">
              Ces systèmes nécessitent principalement des obligations de transparence.
              Exemple : un chatbot qui doit informer clairement l&apos;utilisateur qu&apos;il parle à une IA et non à un humain.
            </p>
          </div>

          <div className="border rounded-md p-3 bg-emerald-50">
            <h3 className="text-sm font-semibold text-emerald-700">
              2.4 – Risque minimal
            </h3>
            <p className="text-sm text-slate-700 mt-1">
              Jeux vidéo, filtres photo, fonctionnalités basiques d&apos;assistants logiciels… Ces usages sont considérés
              comme à risque faible et ne sont soumis qu&apos;à des obligations limitées.
            </p>
          </div>
        </div>
      </section>

      {/* Bloc 3 – Obligations principales pour les systèmes à haut risque */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-1">
          3 – Quelles obligations pour les systèmes à haut risque ?
        </h2>
        <p className="text-sm text-slate-700">
          Pour un système classé &laquo; haut risque &raquo;, l&apos;organisation doit être capable de démontrer une vraie maîtrise du système IA.
          Concrètement, cela implique notamment :
        </p>
        <ul className="text-sm text-slate-700 list-disc list-inside space-y-1">
          <li>Mise en place d&apos;un <span className="font-medium">système de gestion des risques</span> dédié à l&apos;IA.</li>
          <li><span className="font-medium">Qualité et gouvernance des données</span> : données pertinentes, représentatives, documentées.</li>
          <li><span className="font-medium">Documentation technique</span> suffisante pour comprendre le fonctionnement et les limites du système.</li>
          <li><span className="font-medium">Transparence et information des utilisateurs</span> sur le rôle réel de l&apos;IA dans la décision.</li>
          <li><span className="font-medium">Supervision humaine</span> : l&apos;IA ne doit pas être une boîte noire incontrôlée.</li>
          <li><span className="font-medium">Robustesse, cybersécurité, tests réguliers</span> pour limiter les erreurs et les dérives.</li>
          <li><span className="font-medium">Journalisation</span> pour pouvoir retracer les décisions et les incidents.</li>
        </ul>
      </section>

      {/* Bloc 4 – Risques pour une entreprise qui ne se met pas en conformité */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-1">
          4 – Quels risques pour l&apos;organisation ?
        </h2>
        <p className="text-sm text-slate-700">
          Ne pas anticiper l&apos;AI Act, ce n&apos;est pas seulement un risque juridique théorique.
          C&apos;est un risque global pour l&apos;entreprise :
        </p>
        <ul className="text-sm text-slate-700 list-disc list-inside space-y-1">
          <li>
            <span className="font-medium">Risque financier</span> : amendes potentielles très élevées (proportion du chiffre d&apos;affaires),
            coûts d&apos;urgence pour corriger un système non conforme.
          </li>
          <li>
            <span className="font-medium">Risque d&apos;image et de réputation</span> : perte de confiance des clients, des collaborateurs,
            des partenaires ou des régulateurs.
          </li>
          <li>
            <span className="font-medium">Risque contractuel</span> : blocage de certains deals si l&apos;entreprise n&apos;est pas en mesure
            de démontrer la conformité de ses systèmes IA.
          </li>
          <li>
            <span className="font-medium">Risque opérationnel</span> : décisions biaisées, discrimination, erreurs à grande échelle,
            absence de traçabilité en cas de litige.
          </li>
        </ul>
                <h3 className="text-sm font-semibold mt-4">
          4.1 – Sanctions prévues par l&apos;AI Act
        </h3>
        <p className="text-sm text-slate-700 mt-1">
          Le règlement prévoit un régime de sanctions gradué, proche du RGPD, avec des plafonds très élevés en cas de non-conformité :
        </p>
        <ul className="text-sm text-slate-700 list-disc list-inside space-y-1 mt-1">
          <li>
            Jusqu&apos;à <span className="font-medium">35 M€ ou 7 % du chiffre d&apos;affaires annuel mondial</span>{" "}
            pour les pratiques d&apos;IA interdites (par exemple, certains usages de score social ou de surveillance de masse).
          </li>
          <li>
            Jusqu&apos;à <span className="font-medium">15 M€ ou 3 % du chiffre d&apos;affaires</span> pour le non-respect
            des obligations clés sur les systèmes à haut risque (gestion des risques, qualité des données, documentation,
            supervision humaine, etc.).
          </li>
          <li>
            Jusqu&apos;à <span className="font-medium">7,5 M€ ou 1 % du chiffre d&apos;affaires</span> en cas
            d&apos;informations fausses, incomplètes ou trompeuses fournies aux autorités.
          </li>
        </ul>
        <p className="text-xs text-slate-500 mt-2">
          Les autorités nationales disposent d&apos;une marge d&apos;appréciation : les sanctions doivent rester
          proportionnées, mais elles seront d&apos;autant plus lourdes en cas de non-coopération, de manquements répétés
          ou d&apos;impact important sur les droits des personnes.
        </p>

      </section>

      {/* Bloc 5 – Rôle de Concordia */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-1">
          5 – Comment Concordia aide sur l&apos;AI Act ?
        </h2>
        <p className="text-sm text-slate-700">
          Concordia n&apos;est pas un simple &laquo; rapport IA &raquo; générique. La plateforme a été pensée pour
          aider les équipes à structurer leur démarche de conformité et de maîtrise des risques IA.
        </p>
        <ul className="text-sm text-slate-700 list-disc list-inside space-y-1">
          <li>
            <span className="font-medium">Cartographier les cas d&apos;usage IA</span> : secteur, type d&apos;usage, département interne.
          </li>
          <li>
            <span className="font-medium">Qualifier le niveau de risque</span> en lien avec la logique de l&apos;AI Act (classification, impacts, contexte).
          </li>
          <li>
            <span className="font-medium">Identifier les red flags</span> : zones d&apos;inconfort réglementaire, manque de gouvernance, transparence insuffisante, etc.
          </li>
          <li>
            <span className="font-medium">Proposer un plan d&apos;action structuré</span> : priorisation des chantiers à lancer pour sécuriser le système.
          </li>
          <li>
            <span className="font-medium">Générer une base documentaire</span> réutilisable pour échanger avec les équipes Risk, Compliance, DSI ou les autorités.
          </li>
        </ul>
        <p className="text-sm text-muted-foreground">
          L&apos;objectif : transformer l&apos;AI Act en un cadre concret, exploitable par les équipes, plutôt qu&apos;en contrainte floue et subie.
        </p>
      </section>

            {/* Bloc 6 – Ressources officielles */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-1">
          6 – Ressources officielles (AI Act)
        </h2>
        <p className="text-sm text-slate-700">
          Pour aller plus loin, voici les sources officielles et documents de référence publiés par l’Union européenne
          concernant le règlement AI Act, sa version finale et ses implications concrètes.
        </p>

        <ul className="space-y-2 text-sm">
          <li>
            <a
              href="https://www.europarl.europa.eu/news/fr/press-room/20240308IPR20031/l-ue-adopte-la-premiere-legislation-sur-l-intelligence-artificielle"
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              🔗 Communiqué officiel du Parlement européen (adoption de l’AI Act)
            </a>
          </li>

          <li>
            <a
              href="https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX%3A52021PC0206"
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              🔗 Texte complet de la proposition initiale (EUR-Lex)
            </a>
          </li>

          <li>
            <a
              href="https://digital-strategy.ec.europa.eu/en/policies/european-approach-artificial-intelligence"
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              🔗 Page officielle de la Commission européenne : stratégie IA & AI Act
            </a>
          </li>

          <li>
            <a
              href="https://artificialintelligenceact.eu/"
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              🔗 Site de suivi (non officiel mais recommandé) : Artificial Intelligence Act Tracker
            </a>
          </li>

          <li>
            <a
              href="https://commission.europa.eu/system/files/2021-04/communication-fostering-european-approach-artificial-intelligence_en.pdf"
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              🔗 Document PDF : Cadre européen sur l’IA (Commission)
            </a>
          </li>

          <li>
            <a
              href="https://digital-strategy.ec.europa.eu/en/library/regulation-laying-down-harmonised-rules-artificial-intelligence"
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              🔗 Bibliothèque officielle : toutes les versions et documents du règlement
            </a>
          </li>
        </ul>

        <p className="text-xs text-muted-foreground">
          Ces ressources sont mises à jour régulièrement. Elles permettent de suivre l&apos;évolution
          de l&apos;AI Act, des amendements adoptés et des lignes directrices publiées par les institutions européennes.
        </p>
      </section>

    </main>
  );
}
