import Link from "next/link";

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">

      {/* NAV */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <span className="text-sm font-bold text-white tracking-tight">Concordia</span>
        </Link>
        <Link
          href="/register"
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition"
        >
          Commencer →
        </Link>
      </nav>

      {/* CONTENT */}
      <main className="flex-1 px-6 py-16 flex justify-center">
        <div className="w-full max-w-3xl">

          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-slate-400 mb-6">
              Document contractuel
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight mb-3">
              Conditions Générales d'Utilisation
            </h1>
            <p className="text-slate-400 text-sm">
              Contrat de Service SaaS B2B — Concordia AI
            </p>
          </div>

          {/* Parties */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-8 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Entre</p>
            <p className="text-sm text-slate-300 leading-relaxed">
              <span className="font-semibold text-white">CONCORDIA AI</span> — Société par Actions Simplifiée Unipersonnelle (SASU) au capital de 1 000 €, immatriculée au RCS de Vichy, ayant son siège social au 11 rue des Pins, 03300 Creuzier-le-Vieux, représentée par Alban Bouquet des Chaux, Président (ci-après le <span className="text-slate-200">« Fournisseur »</span>)
            </p>
            <p className="text-xs text-slate-500">Et</p>
            <p className="text-sm text-slate-300 leading-relaxed">
              Toute personne morale ou physique professionnelle souscrivant à la Solution (ci-après le <span className="text-slate-200">« Client »</span>)
            </p>
          </div>

          {/* Préambule */}
          <Section title="Préambule">
            <p>
              Le Fournisseur édite et exploite une solution logicielle en mode Software as a Service (SaaS) dénommée <strong className="text-white">Concordia</strong>, destinée à faciliter la gestion de la conformité à l'AI Act pour les entreprises. Le Client, professionnel agissant dans le cadre de son activité, souhaite bénéficier des services de la Solution pour l'aider dans sa démarche de conformité.
            </p>
            <p>
              Les présentes Conditions Générales d'Utilisation (ci-après les « CGU » ou le « Contrat ») ont pour objet de définir les termes et conditions dans lesquels le Fournisseur fournit la Solution au Client.
            </p>
          </Section>

          {/* Article 1 */}
          <Section title="Article 1 – Objet">
            <p>
              Le présent Contrat a pour objet de définir les conditions techniques et financières dans lesquelles le Fournisseur met à disposition du Client la Solution Concordia, accessible à distance via Internet, ainsi que les services associés.
            </p>
          </Section>

          {/* Article 2 */}
          <Section title="Article 2 – Accès et utilisation de la Solution">
            <p>
              <span className="text-slate-200 font-semibold">2.1.</span> Le Fournisseur concède au Client, qui l'accepte, un droit d'accès non exclusif, non transférable et limité à l'utilisation de la Solution, pour la durée du Contrat et pour les besoins propres de son activité.
            </p>
            <p>
              <span className="text-slate-200 font-semibold">2.2.</span> Le Client s'engage à utiliser la Solution conformément à sa destination et aux présentes CGU.
            </p>
          </Section>

          {/* Article 3 */}
          <Section title="Article 3 – Fonctionnalités et Disclaimer">
            <p><span className="text-slate-200 font-semibold">3.1.</span> La Solution Concordia permet notamment au Client de :</p>
            <ul className="list-none space-y-1.5 mt-3">
              {[
                "Cartographier ses cas d'usage IA",
                "Qualifier automatiquement le niveau de risque (AI Act)",
                "Associer les obligations applicables par cas d'usage",
                "Gérer le statut des obligations (Non conforme / En cours / Conforme)",
                "Attribuer des responsables (owner) par obligation",
                "Définir des deadlines par obligation",
                "Ajouter et gérer des preuves (lien, document, fichier)",
                "Versionner les preuves (modification traçable)",
                "Conserver un historique opposable (ledger avec hash + horodatage)",
                "Lier les actions et preuves à un audit donné",
                "Synchroniser automatiquement les obligations après audit",
                "Visualiser un registre de conformité vivant (pilotage global)",
                "Accéder à la liste des obligations par cas d'usage",
                "Éditer les détails des obligations (édition + preuves + historique)",
                "Réaliser des snapshots / gels du registre (preuve d'état à un instant T)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4">
              <span className="text-slate-200 font-semibold">3.2.</span> Le Fournisseur s'engage à fournir la Solution avec diligence et selon les règles de l'art.
            </p>
            <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-500 mb-2">3.3. Disclaimer — Non-conseil juridique</p>
              <p className="text-sm text-slate-300 leading-relaxed">
                Le Client reconnaît et accepte expressément que la Solution Concordia est un outil d'aide à la gestion et au pilotage de la conformité. Elle ne constitue en aucun cas un service de conseil juridique, fiscal, réglementaire ou de certification. Les informations, qualifications de risque et obligations générées par la Solution sont fournies à titre indicatif et ne sauraient se substituer à l'avis d'un professionnel du droit ou à une analyse juridique personnalisée. Le Client est seul responsable de l'interprétation des informations fournies par la Solution et des décisions qu'il prend en matière de conformité.
              </p>
            </div>
          </Section>

          {/* Article 4 */}
          <Section title="Article 4 – Conditions financières">
            <p>
              <span className="text-slate-200 font-semibold">4.1.</span> En contrepartie de l'accès et de l'utilisation de la Solution, le Client s'engage à payer au Fournisseur un abonnement mensuel fixe, dont le montant est défini dans le bon de commande ou l'offre commerciale spécifique.
            </p>
            <p>
              <span className="text-slate-200 font-semibold">4.2.</span> Les prix sont exprimés en Euros et s'entendent hors taxes. Ils seront majorés des taxes en vigueur au jour de la facturation.
            </p>
            <p>
              <span className="text-slate-200 font-semibold">4.3.</span> Les factures sont payables à 30 jours fin de mois à compter de leur date d'émission.
            </p>
          </Section>

          {/* Article 5 */}
          <Section title="Article 5 – Durée et résiliation">
            <p>
              <span className="text-slate-200 font-semibold">5.1.</span> Le présent Contrat est conclu pour une durée indéterminée, sans engagement, renouvelable tacitement.
            </p>
            <p>
              <span className="text-slate-200 font-semibold">5.2.</span> Chaque Partie pourra résilier le Contrat par lettre recommandée avec accusé de réception, moyennant un préavis de 1 mois avant la fin de la période en cours.
            </p>
          </Section>

          {/* Article 6 */}
          <Section title="Article 6 – Propriété intellectuelle">
            <p>
              Le Fournisseur est et demeure seul titulaire de l'ensemble des droits de propriété intellectuelle afférents à la Solution. Le présent Contrat n'opère aucun transfert de propriété au bénéfice du Client.
            </p>
          </Section>

          {/* Article 7 */}
          <Section title="Article 7 – Confidentialité">
            <p>
              Chaque Partie s'engage à garder confidentielles toutes les informations de l'autre Partie dont elle aurait connaissance dans le cadre de l'exécution du présent Contrat.
            </p>
          </Section>

          {/* Article 8 */}
          <Section title="Article 8 – Protection des données personnelles (RGPD)">
            <p>
              Dans le cadre de la fourniture de la Solution, le Fournisseur pourra être amené à traiter des données personnelles pour le compte du Client. Les Parties s'engagent à respecter la réglementation en vigueur en matière de protection des données personnelles, notamment le Règlement (UE) 2016/679 (RGPD). Un Accord de Traitement des Données (DPA) sera annexé au présent Contrat pour préciser les rôles et obligations de chaque Partie.
            </p>
          </Section>

          {/* Article 9 */}
          <Section title="Article 9 – Responsabilité">
            <p>
              <span className="text-slate-200 font-semibold">9.1. Obligation de moyens</span> — Le Fournisseur est soumis à une obligation de moyens dans le cadre de l'exécution du présent Contrat. Il s'engage à mettre en œuvre tous les moyens raisonnables pour assurer l'accès et le bon fonctionnement de la Solution, ainsi que la pertinence des informations générées, mais ne garantit en aucun cas un résultat spécifique en termes de conformité ou de succès aux audits.
            </p>
            <p>
              <span className="text-slate-200 font-semibold">9.2. Limitation de responsabilité</span> — La responsabilité du Fournisseur ne pourra être engagée qu'en cas de faute prouvée et directe dans l'exécution de ses obligations. Le Fournisseur ne pourra en aucun cas être tenu responsable des dommages indirects, tels que, sans que cette liste soit limitative, les pertes de profits, de revenus, de données, de clientèle, les préjudices commerciaux, les sanctions administratives ou amendes liées à l'AI Act ou à toute autre réglementation, ou les coûts de substitution de biens ou services.
            </p>
            <p>
              <span className="text-slate-200 font-semibold">9.3. Plafond de responsabilité</span> — En tout état de cause, la responsabilité cumulée du Fournisseur au titre du présent Contrat est expressément limitée au montant total des sommes effectivement payées par le Client au Fournisseur au cours des douze (12) mois précédant la survenance du fait générateur du dommage.
            </p>
          </Section>

          {/* Article 10 */}
          <Section title="Article 10 – Force majeure">
            <p>
              Aucune des Parties ne pourra être tenue responsable de la non-exécution ou du retard dans l'exécution de l'une de ses obligations si cette non-exécution ou ce retard est dû à un cas de force majeure.
            </p>
          </Section>

          {/* Article 11 */}
          <Section title="Article 11 – Loi applicable et juridiction compétente">
            <p>
              Le présent Contrat est régi par le droit français. Tout litige relatif à la validité, l'interprétation ou l'exécution du présent Contrat sera soumis à la compétence exclusive des tribunaux de <strong className="text-white">Vichy</strong>.
            </p>
          </Section>

          {/* Annexes */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mt-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Annexes</p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                Annexe 1 : Accord de Traitement des Données (DPA) — à compléter séparément
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                Annexe 2 : Conditions de Service (SLA) — à compléter séparément
              </li>
            </ul>
          </div>

          {/* CTA retour */}
          <div className="mt-12 flex items-center gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition"
            >
              Créer mon compte →
            </Link>
            <Link
              href="/"
              className="text-sm text-slate-500 hover:text-slate-300 transition"
            >
              ← Retour à l'accueil
            </Link>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="px-8 py-6 border-t border-white/5 flex items-center justify-between flex-wrap gap-4">
        <div className="text-xs text-slate-600">
          Concordia · Règlement (UE) 2024/1689 · AI Act
        </div>
        <div className="flex items-center gap-6 text-xs text-slate-600">
          <Link href="/mentions-legales" className="hover:text-slate-400 transition">Mentions légales</Link>
          <Link href="/cgu" className="hover:text-slate-400 transition">CGU</Link>
          <Link href="/pricing" className="hover:text-slate-400 transition">Tarifs</Link>
          <Link href="/login" className="hover:text-slate-400 transition">Connexion</Link>
        </div>
      </footer>

    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-base font-bold text-white mb-3 pb-3 border-b border-white/10">
        {title}
      </h2>
      <div className="space-y-3 text-sm text-slate-400 leading-relaxed">
        {children}
      </div>
    </div>
  );
}