import Link from "next/link";

export default function DPAPage() {
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
              Document contractuel · Annexe 1 CGU
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight mb-3">
              Accord de Traitement des Données
            </h1>
            <p className="text-slate-400 text-sm">
              DPA — Conforme à l'article 28 du Règlement (UE) 2016/679 (RGPD) · Version 1.0 · Avril 2026
            </p>
          </div>

          {/* Parties */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-8 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Entre</p>
            <p className="text-sm text-slate-300 leading-relaxed">
              <span className="font-semibold text-white">CONCORDIA AI</span> — SASU, 11 rue des Pins, 03300 Creuzier-le-Vieux, représentée par Alban Bouquet des Chaux (ci-après le <span className="text-slate-200">« Sous-traitant »</span>)
            </p>
            <p className="text-xs text-slate-500">Et</p>
            <p className="text-sm text-slate-300 leading-relaxed">
              Le Client ayant souscrit à la Solution Concordia (ci-après le <span className="text-slate-200">« Responsable de traitement »</span>)
            </p>
            <div className="mt-2 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3">
              <p className="text-xs text-slate-400">
                Le présent DPA est opposable dès l'acceptation des Conditions Générales d'Utilisation de Concordia AI.
              </p>
            </div>
          </div>

          {/* Article 1 */}
          <Section title="Article 1 — Objet et durée">
            <p>
              Le présent Accord de Traitement des Données (ci-après le « DPA ») définit les conditions dans lesquelles le Sous-traitant traite des données personnelles pour le compte du Responsable de traitement dans le cadre de la fourniture de la Solution Concordia.
            </p>
            <p>
              Il entre en vigueur à la date de création du compte et reste en vigueur pendant toute la durée du contrat principal, puis jusqu'à destruction complète des données conformément à l'Article 9.
            </p>
          </Section>

          {/* Article 2 */}
          <Section title="Article 2 — Nature et finalités du traitement">
            <p>Le Sous-traitant traite les données personnelles suivantes pour le compte du Responsable de traitement :</p>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold text-white mb-2">Catégories de données</p>
                <ul className="space-y-1.5">
                  {[
                    "Données d'identification des utilisateurs : nom, prénom, adresse email, numéro de téléphone",
                    "Données professionnelles : nom de l'organisation, fonction, secteur d'activité",
                    "Données de conformité : cas d'usage IA, obligations réglementaires, preuves de conformité, historique des actions",
                    "Données de connexion : logs d'accès, horodatages",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-slate-400">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold text-white mb-2">Catégories de personnes concernées</p>
                <ul className="space-y-1.5">
                  {[
                    "Utilisateurs de la Solution (collaborateurs du Responsable de traitement)",
                    "Référents conformité désignés",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-slate-400">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold text-white mb-2">Finalités du traitement</p>
                <ul className="space-y-1.5">
                  {[
                    "Fourniture et exploitation de la Solution Concordia",
                    "Gestion du registre de conformité AI Act",
                    "Horodatage et traçabilité des actions (ledger SHA-256)",
                    "Support technique et relation client",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-slate-400">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          {/* Article 3 */}
          <Section title="Article 3 — Obligations du Sous-traitant">
            {[
              {
                num: "3.1",
                label: "Instructions documentées",
                text: "Traiter les données personnelles uniquement sur instruction documentée du Responsable de traitement, telle qu'exprimée dans le contrat principal et le présent DPA. Si le Sous-traitant estime qu'une instruction viole le RGPD, il en informe immédiatement le Responsable de traitement.",
              },
              {
                num: "3.2",
                label: "Confidentialité",
                text: "Veiller à ce que les personnes autorisées à traiter les données personnelles s'engagent à respecter la confidentialité ou soient soumises à une obligation légale appropriée de confidentialité.",
              },
              {
                num: "3.3",
                label: "Sécurité",
                text: "Mettre en œuvre les mesures techniques et organisationnelles appropriées visées à l'Article 5 du présent DPA afin de garantir un niveau de sécurité adapté au risque.",
              },
              {
                num: "3.4",
                label: "Sous-traitants ultérieurs",
                text: "Ne pas recruter de nouveaux sous-traitants ultérieurs sans en informer le Responsable de traitement. Une autorisation générale est donnée par le Responsable de traitement pour les sous-traitants ultérieurs listés à l'Article 6. Le Sous-traitant informe le Responsable de traitement de tout changement prévu concernant l'ajout ou le remplacement d'un sous-traitant ultérieur, lui donnant ainsi la possibilité d'émettre des objections.",
              },
              {
                num: "3.5",
                label: "Assistance au Responsable de traitement",
                text: "Aider le Responsable de traitement, dans la mesure du possible, à s'acquitter de son obligation de donner suite aux demandes d'exercice des droits des personnes concernées (accès, rectification, effacement, portabilité, opposition, limitation).",
              },
              {
                num: "3.6",
                label: "Assistance pour les obligations RGPD",
                text: "Aider le Responsable de traitement à garantir le respect des obligations relatives à la sécurité, à la notification des violations, à l'analyse d'impact et à la consultation préalable, compte tenu de la nature du traitement et des informations à la disposition du Sous-traitant.",
              },
              {
                num: "3.7",
                label: "Audits",
                text: "Mettre à disposition du Responsable de traitement toutes les informations nécessaires pour démontrer le respect des obligations prévues au présent DPA, et permettre la réalisation d'audits ou d'inspections, menés par le Responsable de traitement ou un auditeur mandaté par lui, en donnant un préavis écrit de 30 jours minimum.",
              },
            ].map((item) => (
              <div key={item.num} className="mt-3">
                <p className="text-sm text-slate-400 leading-relaxed">
                  <span className="font-semibold text-slate-200">{item.num} {item.label} — </span>
                  {item.text}
                </p>
              </div>
            ))}
          </Section>

          {/* Article 4 */}
          <Section title="Article 4 — Obligations du Responsable de traitement">
            <p>Le Responsable de traitement s'engage à :</p>
            <ul className="mt-3 space-y-2">
              {[
                "Fournir au Sous-traitant des instructions licites et documentées concernant le traitement des données",
                "S'assurer que les personnes concernées ont été informées du traitement de leurs données",
                "Veiller à la licéité de la collecte des données transmises au Sous-traitant",
                "Notifier sans délai le Sous-traitant de toute modification des instructions de traitement",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          {/* Article 5 */}
          <Section title="Article 5 — Mesures de sécurité techniques et organisationnelles (TOM)">
            <p>Le Sous-traitant met en œuvre les mesures suivantes :</p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold text-white mb-2">Sécurité technique</p>
                <ul className="space-y-1.5">
                  {[
                    "Chiffrement des données en transit (HTTPS/TLS)",
                    "Chiffrement des données au repos (Supabase/AWS)",
                    "Authentification par JWT avec sessions sécurisées",
                    "Hachage des mots de passe (bcrypt, 12 rounds)",
                    "Registre cryptographique SHA-256 horodaté et chaîné",
                    "Isolation des données par organisation",
                    "Sauvegardes automatiques quotidiennes",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-slate-400">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold text-white mb-2">Sécurité organisationnelle</p>
                <ul className="space-y-1.5">
                  {[
                    "Accès aux données de production limité au personnel strictement nécessaire",
                    "Politique de confidentialité opposable aux collaborateurs",
                    "Procédure de gestion des incidents de sécurité",
                    "Notification des violations dans les 72 heures suivant leur détection",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-slate-400">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          {/* Article 6 */}
          <Section title="Article 6 — Sous-traitants ultérieurs autorisés">
            <p>Le Responsable de traitement donne une autorisation générale au Sous-traitant pour faire appel aux sous-traitants ultérieurs suivants :</p>
            <div className="mt-4 rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Sous-traitant</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Rôle</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Localisation</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Garantie</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Supabase (AWS eu-north-1)", role: "Base de données", location: "Stockholm, UE", guarantee: "Intra-UE ✅" },
                    { name: "Vercel Inc.", role: "Hébergement applicatif", location: "USA + Edge mondial", guarantee: "SCCs UE" },
                    { name: "Resend Inc.", role: "Emails transactionnels", location: "USA", guarantee: "SCCs UE" },
                    { name: "OpenAI LLC", role: "Traitement IA", location: "USA", guarantee: "SCCs UE" },
                  ].map((row, i) => (
                    <tr key={row.name} className={i % 2 === 0 ? "bg-white/0" : "bg-white/[0.02]"}>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-300">{row.name}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{row.role}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{row.location}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{row.guarantee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Le Sous-traitant s'assure que ses sous-traitants ultérieurs présentent des garanties suffisantes quant à la mise en œuvre de mesures techniques et organisationnelles appropriées.
            </p>
          </Section>

          {/* Article 7 */}
          <Section title="Article 7 — Transferts de données hors UE">
            <p>
              Pour les sous-traitants ultérieurs situés hors de l'Union européenne (Vercel, Resend, OpenAI), les transferts sont encadrés par les Clauses Contractuelles Types (CCT) adoptées par la Commission européenne conformément à la décision 2021/914/UE.
            </p>
          </Section>

          {/* Article 8 */}
          <Section title="Article 8 — Violations de données personnelles">
            <p>
              En cas de violation de données personnelles, le Sous-traitant notifie le Responsable de traitement dans les meilleurs délais et au plus tard dans les <strong className="text-white">72 heures</strong> suivant la prise de connaissance de la violation. La notification comprend :
            </p>
            <ul className="mt-3 space-y-2">
              {[
                "La nature de la violation",
                "Les catégories et le nombre approximatif de personnes concernées",
                "Les catégories et le nombre approximatif d'enregistrements concernés",
                "Les mesures prises ou envisagées pour remédier à la violation",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          {/* Article 9 */}
          <Section title="Article 9 — Sort des données en fin de contrat">
            <p>À l'expiration ou résiliation du contrat principal, le Sous-traitant s'engage à :</p>
            <div className="mt-4 space-y-3">
              {[
                {
                  num: "1",
                  label: "Mise à disposition pour export",
                  text: "Dans les 30 jours suivant la fin du contrat, le Responsable de traitement peut exporter l'ensemble de ses données via l'interface de la Solution ou en faisant une demande à privacy@concordia-ai.eu.",
                },
                {
                  num: "2",
                  label: "Suppression",
                  text: "À l'issue du délai de 30 jours, ou sur demande expresse du Responsable de traitement, le Sous-traitant procède à la suppression définitive et irréversible de l'ensemble des données personnelles du Responsable de traitement.",
                },
                {
                  num: "3",
                  label: "Attestation",
                  text: "Sur demande, le Sous-traitant fournit une attestation écrite de destruction des données.",
                },
              ].map((item) => (
                <div key={item.num} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold text-white mb-1">{item.num}. {item.label}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Les données de facturation sont conservées conformément aux obligations légales (10 ans).
            </p>
          </Section>

          {/* Article 10 */}
          <Section title="Article 10 — Loi applicable">
            <p>
              Le présent DPA est régi par le droit français et le Règlement (UE) 2016/679 (RGPD). Tout litige relatif à son interprétation ou exécution est soumis à la compétence exclusive des tribunaux de <strong className="text-white">Vichy</strong>.
            </p>
            <p className="mt-3 text-sm text-slate-500">
              Fait à Creuzier-le-Vieux — Version 1.0 — Avril 2026
            </p>
          </Section>

          {/* CTA retour */}
          <div className="mt-12 flex items-center gap-4">
            <Link href="/cgu" className="text-sm text-slate-500 hover:text-slate-300 transition">
              ← Retour aux CGU
            </Link>
            <Link href="/register" className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition">
              Créer mon compte →
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
          <Link href="/politique-confidentialite" className="hover:text-slate-400 transition">Confidentialité</Link>
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
      <h2 className="text-base font-bold text-white mb-4 pb-3 border-b border-white/10">
        {title}
      </h2>
      <div className="space-y-3 text-sm text-slate-400 leading-relaxed">
        {children}
      </div>
    </div>
  );
}