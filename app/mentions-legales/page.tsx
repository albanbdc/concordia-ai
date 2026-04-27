import Link from "next/link";

export default function MentionsLegalesPage() {
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
              Document légal
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight mb-3">
              Mentions Légales
            </h1>
            <p className="text-slate-400 text-sm">
              Conformément à la Loi n° 2004-575 du 21 juin 2004 (L.C.E.N.) — site app.concordia-ai.eu
            </p>
          </div>

          {/* Intro */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-8">
            <p className="text-sm text-slate-300 leading-relaxed">
              Conformément aux dispositions des articles 6-III et 19 de la Loi n° 2004-575 du 21 juin 2004 pour la Confiance dans l'économie numérique, dite L.C.E.N., il est porté à la connaissance des utilisateurs et visiteurs du site les présentes mentions légales.
            </p>
            <p className="text-sm text-slate-400 leading-relaxed mt-3">
              La connexion, l'utilisation et l'accès à ce site impliquent l'acceptation intégrale et sans réserve de l'internaute de toutes les dispositions des présentes Mentions Légales.
            </p>
          </div>

          {/* Article 1 */}
          <Section title="Article 1 – Informations légales">
            <p className="text-slate-400 text-sm leading-relaxed">
              En vertu de l'Article 6 de la Loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique, il est précisé l'identité des différents intervenants dans le cadre de la réalisation et du suivi du site.
            </p>

            <SubSection label="A. Éditeur du site">
              <InfoRow label="Société" value="CONCORDIA AI — Société par Actions Simplifiée Unipersonnelle (SASU)" />
              <InfoRow label="Capital social" value="1 000 €" />
              <InfoRow label="RCS" value="Vichy — [Numéro RCS à compléter]" />
              <InfoRow label="TVA intracommunautaire" value="En cours d'attribution" />
              <InfoRow label="Siège social" value="11 rue des Pins, 03300 Creuzier-le-Vieux" />
              <InfoRow label="Email" value="albantwd@gmail.com" />
              <InfoRow label="Téléphone" value="07 59 65 48 03" />
            </SubSection>

            <SubSection label="B. Directeur de la publication">
              <InfoRow label="Nom" value="Alban Bouquet des Chaux" />
              <InfoRow label="Contact" value="albantwd@gmail.com" />
            </SubSection>

            <SubSection label="C. Hébergeur du site">
              <InfoRow label="Société" value="OVH Cloud" />
              <InfoRow label="Siège social" value="2 rue Kellermann, 59100 Roubaix — France" />
              <InfoRow label="Téléphone" value="09 72 10 10 07" />
            </SubSection>

            <SubSection label="D. Utilisateurs">
              <p className="text-sm text-slate-400 leading-relaxed">
                Sont considérés comme utilisateurs tous les internautes qui naviguent, lisent, visionnent et utilisent le site CONCORDIA AI.
              </p>
            </SubSection>
          </Section>

          {/* Article 2 */}
          <Section title="Article 2 – Accessibilité">
            <p className="text-sm text-slate-400 leading-relaxed">
              Le site est par principe accessible aux utilisateurs 24h/24, 7j/7, sauf interruption, programmée ou non, pour des besoins de maintenance ou en cas de force majeure. En cas d'impossibilité d'accès au site, l'Éditeur s'engage à faire son maximum afin d'en rétablir l'accès. L'Éditeur ne saurait être tenu pour responsable de tout dommage, quelle qu'en soit la nature, résultant d'une indisponibilité du site.
            </p>
          </Section>

          {/* Article 3 */}
          <Section title="Article 3 – Loi applicable et juridiction">
            <p className="text-sm text-slate-400 leading-relaxed">
              Les présentes Mentions Légales sont régies par la loi française. Tout litige ou désaccord qui pourrait naître de l'interprétation ou de l'exécution des présentes Mentions Légales sera de la compétence exclusive des tribunaux de <strong className="text-white">Vichy</strong>.
            </p>
          </Section>

          {/* Article 4 */}
          <Section title="Article 4 – Contact">
            <p className="text-sm text-slate-400 leading-relaxed">
              Pour tout signalement de contenus ou activités illicites, l'utilisateur peut contacter l'Éditeur à l'adresse suivante :{" "}
              <a href="mailto:albantwd@gmail.com" className="text-white underline underline-offset-2 hover:text-slate-300 transition">
                albantwd@gmail.com
              </a>{" "}
              ou par courrier recommandé avec accusé de réception adressé à l'Éditeur aux coordonnées précisées à l'Article 1.
            </p>
            <p className="text-sm text-slate-500 mt-3">
              Fait à Creuzier-le-Vieux, le 30 Mars 2026.
            </p>
          </Section>

          {/* CTA retour */}
          <div className="mt-12 flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-slate-500 hover:text-slate-300 transition"
            >
              ← Retour à l'accueil
            </Link>
            <Link
              href="/cgu"
              className="text-sm text-slate-500 hover:text-slate-300 transition"
            >
              Consulter les CGU →
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
          <Link href="/dpa" className="hover:text-slate-400 transition">DPA</Link>
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
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

function SubSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">{label}</p>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="text-slate-500 flex-shrink-0 w-40">{label}</span>
      <span className="text-slate-300">{value}</span>
    </div>
  );
}