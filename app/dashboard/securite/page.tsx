export default function SecuritePage() {
  return (
    <main className="max-w-4xl mx-auto py-10 space-y-8">
      {/* Titre + intro */}
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold">Sécurité &amp; Confidentialité</h1>
        <p className="text-sm text-muted-foreground">
          Chez Concordia, la sécurité et la confidentialité de vos données ne sont pas une option : c&apos;est une
          priorité. Nous construisons une solution de gouvernance IA qui respecte des standards élevés afin de protéger
          vos informations, vos utilisateurs et votre organisation.
        </p>
      </section>

      {/* 1 – Sécurité technique */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-1">1 – Sécurité technique</h2>

        <div className="space-y-3">
          <div className="border rounded-md p-3 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-800">
              1.1 – Infrastructure sécurisée
            </h3>
            <ul className="mt-1 list-disc list-inside text-sm text-slate-700 space-y-1">
              <li>Chiffrement des données au repos (ex : chiffrement côté base de données).</li>
              <li>Chiffrement des communications (HTTPS / TLS) entre le navigateur et nos serveurs.</li>
              <li>Hébergement sur une infrastructure cloud conforme aux standards européens.</li>
              <li>Isolation stricte des environnements (développement, test, production).</li>
            </ul>
          </div>

          <div className="border rounded-md p-3 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-800">
              1.2 – Mises à jour et correctifs
            </h3>
            <ul className="mt-1 list-disc list-inside text-sm text-slate-700 space-y-1">
              <li>Surveillance continue des vulnérabilités applicatives et des dépendances.</li>
              <li>Mises à jour régulières des composants critiques du système.</li>
              <li>Correction prioritaire en cas de faille de sécurité identifiée.</li>
            </ul>
          </div>

          <div className="border rounded-md p-3 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-800">
              1.3 – Accès et permissions
            </h3>
            <ul className="mt-1 list-disc list-inside text-sm text-slate-700 space-y-1">
              <li>Accès restreint aux environnements techniques selon les rôles et responsabilités.</li>
              <li>Principe du moindre privilège pour les accès internes.</li>
              <li>Journalisation des actions sensibles pour permettre des audits de sécurité.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 2 – Confidentialité des données */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-1">2 – Confidentialité des données</h2>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-800">2.1 – Minimisation &amp; sobriété</h3>
          <p className="text-sm text-slate-700">
            Concordia ne stocke que les informations nécessaires au fonctionnement de la plateforme : description des
            systèmes IA audités, résultats d&apos;audit, métadonnées associées (secteur, type d&apos;usage, département interne).
          </p>
          <p className="text-sm text-slate-700">
            Nous ne collectons pas de données superflues et n&apos;utilisons pas vos contenus à des fins commerciales.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-800">2.2 – Données potentiellement sensibles</h3>
          <p className="text-sm text-slate-700">
            Les systèmes que vous décrivez peuvent parfois concerner des domaines sensibles (santé, finances, RH, secteur
            public…). Concordia est conçu pour limiter l&apos;exposition de ces informations :
          </p>
          <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
            <li>aucune revente de données ;</li>
            <li>aucun partage externe non explicitement autorisé ;</li>
            <li>suppression possible des audits sur demande.</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-800">2.3 – Conformité RGPD</h3>
          <p className="text-sm text-slate-700">
            La plateforme est pensée pour être compatible avec le RGPD :
          </p>
          <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
            <li>traitement limité aux finalités déclarées (audit et gouvernance IA) ;</li>
            <li>droits d&apos;accès, de rectification et de suppression des données garantis ;</li>
            <li>politique de conservation alignée avec les besoins métier et réglementaires.</li>
          </ul>
        </div>
      </section>

      {/* 3 – Utilisation des modèles d'IA */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-1">3 – Utilisation des modèles d&apos;IA</h2>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-800">
            3.1 – Appel à des modèles tiers (ex : OpenAI)
          </h3>
          <p className="text-sm text-slate-700">
            Les analyses d&apos;audit s&apos;appuient sur des modèles d&apos;IA tiers. Les données envoyées aux modèles sont :
          </p>
          <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
            <li>limitée à la description du cas d&apos;usage et au contexte nécessaire ;</li>
            <li>transmises via des canaux chiffrés ;</li>
            <li>non utilisées pour l&apos;entraînement public des modèles, selon les engagements des fournisseurs.</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-800">3.2 – Transparence sur le rôle de l&apos;IA</h3>
          <p className="text-sm text-slate-700">
            Concordia indique clairement le rôle des modèles d&apos;IA dans la génération de l&apos;audit et rappelle la
            nécessité d&apos;une supervision humaine, en particulier pour les décisions à fort enjeu (RH, santé, finance, secteur
            public, etc.).
          </p>
        </div>
      </section>

      {/* 4 – Protection juridique */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-1">4 – Protection juridique</h2>

        <p className="text-sm text-slate-700">
          Concordia vise à fournir non seulement un diagnostic, mais aussi un support de preuve en cas de contrôle ou de
          litige. Chaque audit contribue à documenter que l&apos;organisation :
        </p>
        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
          <li>a identifié et cartographié ses systèmes IA ;</li>
          <li>a analysé les risques associés (AI Act, RGPD, biais, gouvernance…) ;</li>
          <li>a mis en place, ou prévu, des plans d&apos;action correctifs ;</li>
          <li>dispose d&apos;une trace écrite du raisonnement et des arbitrages.</li>
        </ul>
        <p className="text-sm text-slate-700">
          Cette documentation peut contribuer à démontrer une <span className="font-medium">diligence raisonnable</span>
          vis-à-vis des régulateurs, des partenaires ou d&apos;un audit interne.
        </p>
      </section>

      {/* 5 – Transparence & évolution */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-1">5 – Transparence &amp; amélioration continue</h2>
        <p className="text-sm text-slate-700">
          La sécurité et la confidentialité ne sont pas figées : elles évoluent avec les usages, les techniques et les
          régulations. Concordia s&apos;inscrit dans une logique d&apos;amélioration continue :
        </p>
        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
          <li>veilles régulières sur l&apos;AI Act, le RGPD et les bonnes pratiques de sécurité ;</li>
          <li>évolution progressive des fonctionnalités pour renforcer la maîtrise des risques ;</li>
          <li>mise à jour des engagements de sécurité et de confidentialité lorsque nécessaire.</li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Notre objectif est de rester un partenaire fiable pour vos enjeux de gouvernance IA, dans la durée.
        </p>
      </section>
    </main>
  );
}
