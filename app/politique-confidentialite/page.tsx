import Link from "next/link";
 
export default function PolitiqueConfidentialitePage() {
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
              Politique de Confidentialité
            </h1>
            <p className="text-slate-400 text-sm">
              Dernière mise à jour : 30 mars 2026
            </p>
          </div>
 
          {/* Intro */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-8">
            <p className="text-sm text-slate-300 leading-relaxed">
              La présente Politique de Confidentialité décrit la manière dont <strong className="text-white">CONCORDIA AI</strong> collecte, utilise, traite et protège les informations personnelles de ses utilisateurs dans le cadre de l'utilisation de notre solution SaaS Concordia et de notre site web.
            </p>
            <p className="text-sm text-slate-400 leading-relaxed mt-3">
              Nous nous engageons à respecter votre vie privée et à protéger vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD — Règlement (UE) 2016/679) et à la législation française en vigueur.
            </p>
          </div>
 
          {/* 1. Responsable */}
          <Section title="1. Identité du Responsable de Traitement">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
              <InfoRow label="Société" value="CONCORDIA AI — SASU" />
              <InfoRow label="Siège social" value="11 rue des Pins, 03300 Creuzier-le-Vieux" />
              <InfoRow label="Contact" value="albantwd@gmail.com" />
            </div>
          </Section>
 
          {/* 2. Données collectées */}
          <Section title="2. Données Personnelles Collectées">
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Nous collectons les catégories de données personnelles suivantes :
            </p>
            <div className="space-y-3">
              {[
                {
                  label: "Données d'identification",
                  value: "Nom, prénom, adresse e-mail, numéro de téléphone.",
                },
                {
                  label: "Données professionnelles",
                  value: "Nom de l'entreprise, fonction, informations relatives aux cas d'usage IA et aux preuves de conformité téléchargées sur la plateforme.",
                },
                {
                  label: "Données de connexion et d'utilisation",
                  value: "Adresse IP, logs de connexion, données de navigation sur notre site, informations sur l'appareil utilisé.",
                },
                {
                  label: "Données de paiement",
                  value: "Informations relatives aux transactions effectuées via notre prestataire de paiement Stripe (nous ne stockons pas directement vos données bancaires complètes).",
                },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold text-white mb-1">{item.label}</p>
                  <p className="text-sm text-slate-400">{item.value}</p>
                </div>
              ))}
            </div>
          </Section>
 
          {/* 3. Finalités */}
          <Section title="3. Finalités de la Collecte et du Traitement">
            <p className="text-sm text-slate-400 leading-relaxed mb-3">
              Vos données personnelles sont collectées et traitées pour les finalités suivantes :
            </p>
            <ul className="space-y-2">
              {[
                { label: "Fourniture de la Solution", value: "Accès à la plateforme, gestion de votre compte, exécution des fonctionnalités (cartographie IA, qualification des risques, gestion des obligations et preuves)." },
                { label: "Gestion de la relation client", value: "Support technique, communication relative à votre abonnement, envoi d'informations importantes sur la Solution." },
                { label: "Facturation et paiement", value: "Traitement de vos abonnements via Stripe." },
                { label: "Amélioration de nos services", value: "Analyse de l'utilisation de la Solution pour optimiser ses fonctionnalités et son ergonomie." },
                { label: "Sécurité", value: "Maintien de la sécurité de nos systèmes et prévention des fraudes." },
                { label: "Conformité légale", value: "Respect de nos obligations légales et réglementaires." },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                  <span className="text-slate-400"><strong className="text-slate-200">{item.label} — </strong>{item.value}</span>
                </li>
              ))}
            </ul>
          </Section>
 
          {/* 4. Bases légales */}
          <Section title="4. Bases Légales du Traitement">
            <ul className="space-y-2">
              {[
                { label: "Exécution du contrat", value: "Le traitement est nécessaire à l'exécution du contrat d'abonnement à la Solution Concordia." },
                { label: "Intérêt légitime", value: "Pour l'amélioration de nos services, la sécurité de nos systèmes et la gestion de la relation client." },
                { label: "Obligation légale", value: "Pour le respect de nos obligations légales (ex : facturation, conservation des données)." },
                { label: "Consentement", value: "Pour l'envoi de communications marketing (si vous y avez consenti)." },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                  <span className="text-slate-400"><strong className="text-slate-200">{item.label} — </strong>{item.value}</span>
                </li>
              ))}
            </ul>
          </Section>
 
          {/* 5. Destinataires */}
          <Section title="5. Destinataires des Données Personnelles">
            <p className="text-sm text-slate-400 leading-relaxed mb-3">
              Vos données personnelles peuvent être partagées avec :
            </p>
            <ul className="space-y-2 mb-4">
              {[
                "Nos prestataires de services techniques : Hébergeur (OVH Cloud), fournisseurs de services cloud.",
                "Nos prestataires de paiement : Stripe, pour le traitement sécurisé des transactions.",
                "Les autorités compétentes : En cas d'obligation légale ou de demande officielle.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-400">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-sm text-slate-400 leading-relaxed">
              Nous exigeons de nos partenaires qu'ils respectent la confidentialité et la sécurité de vos données et qu'ils agissent conformément au RGPD.
            </p>
          </Section>
 
          {/* 6. Transfert hors UE */}
          <Section title="6. Transfert de Données Hors UE">
            <p className="text-sm text-slate-400 leading-relaxed">
              Vos données personnelles sont principalement stockées sur des serveurs situés au sein de l'Union Européenne (OVH Cloud). Cependant, certains de nos prestataires (ex : Stripe) peuvent transférer des données hors de l'UE. Dans ce cas, nous nous assurons que ces transferts sont encadrés par des garanties appropriées (clauses contractuelles types de la Commission Européenne) conformément au RGPD.
            </p>
          </Section>
 
          {/* 7. Durée conservation */}
          <Section title="7. Durée de Conservation des Données">
            <div className="space-y-3">
              {[
                { label: "Données de compte et d'utilisation", value: "Conservées pendant toute la durée de votre abonnement et jusqu'à 1 an après le dernier contact ou la résiliation, sauf obligation légale de conservation plus longue." },
                { label: "Données de facturation", value: "Conservées pendant 10 ans à compter de la clôture de l'exercice comptable concerné." },
                { label: "Logs de connexion", value: "Conservés pendant 1 an." },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold text-white mb-1">{item.label}</p>
                  <p className="text-sm text-slate-400">{item.value}</p>
                </div>
              ))}
            </div>
          </Section>
 
          {/* 8. Droits */}
          <Section title="8. Vos Droits">
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Conformément au RGPD, vous disposez des droits suivants concernant vos données personnelles :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {[
                { label: "Droit d'accès", value: "Obtenir la confirmation que vos données sont traitées et en obtenir une copie." },
                { label: "Droit de rectification", value: "Demander la correction de données inexactes ou incomplètes." },
                { label: "Droit à l'effacement", value: "Demander la suppression de vos données dans certaines conditions." },
                { label: "Droit à la limitation", value: "Demander la suspension du traitement de vos données dans certaines conditions." },
                { label: "Droit à la portabilité", value: "Recevoir vos données dans un format structuré et lisible par machine." },
                { label: "Droit d'opposition", value: "Vous opposer au traitement de vos données pour des raisons tenant à votre situation particulière." },
                { label: "Retrait du consentement", value: "À tout moment, pour les traitements fondés sur celui-ci." },
                { label: "Droit de réclamation", value: "Auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés)." },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs font-semibold text-white mb-1">{item.label}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
              <p className="text-sm text-slate-300">
                Pour exercer ces droits, contactez-nous à{" "}
                <a href="mailto:albantwd@gmail.com" className="text-white underline underline-offset-2 hover:text-slate-200 transition">
                  albantwd@gmail.com
                </a>{" "}
                ou par courrier à notre siège social.
              </p>
            </div>
          </Section>
 
          {/* 9. Modifications */}
          <Section title="9. Modifications de la Politique de Confidentialité">
            <p className="text-sm text-slate-400 leading-relaxed">
              Nous nous réservons le droit de modifier la présente Politique de Confidentialité à tout moment. Toute modification sera publiée sur cette page avec une date de mise à jour. Nous vous encourageons à consulter régulièrement cette page pour prendre connaissance des éventuelles modifications.
            </p>
            <p className="text-sm text-slate-500 mt-3">
              Fait le 30 mars 2026 à Creuzier-le-Vieux.
            </p>
          </Section>
 
          {/* CTA retour */}
          <div className="mt-12 flex items-center gap-4">
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-300 transition">
              ← Retour à l'accueil
            </Link>
            <Link href="/cgu" className="text-sm text-slate-500 hover:text-slate-300 transition">
              Consulter les CGU →
            </Link>
            <Link href="/mentions-legales" className="text-sm text-slate-500 hover:text-slate-300 transition">
              Mentions légales →
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
      <div className="space-y-3">
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