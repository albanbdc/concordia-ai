// app/dashboard/systems/new/[id]/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function NewUseCasePage() {
  const params = useParams();
  const router = useRouter();
  const systemId = params?.id as string;

  const [title, setTitle] = useState("");
  const [sector, setSector] = useState("");
  const [hasModifiedSubstantially, setHasModifiedSubstantially] = useState(false);
  const [role, setRole] = useState<"DEPLOYER" | "PROVIDER" | "BOTH">("DEPLOYER");

  // Annexe III — 8 domaines
  const [affectsEmployment, setAffectsEmployment] = useState(false);
  const [affectsEducation, setAffectsEducation] = useState(false);
  const [affectsEssentialServices, setAffectsEssentialServices] = useState(false);
  const [affectsJustice, setAffectsJustice] = useState(false);
  const [affectsCriticalInfrastructure, setAffectsCriticalInfrastructure] = useState(false);
  const [affectsLawEnforcement, setAffectsLawEnforcement] = useState(false);
  const [affectsMigration, setAffectsMigration] = useState(false);
  const [affectsBorderManagement, setAffectsBorderManagement] = useState(false);

  // Annexe I — produits réglementés
  const [isAnnexeI, setIsAnnexeI] = useState(false);
  const [annexeIDomain, setAnnexeIDomain] = useState<string>("");

  // Transparence
  const [interactsWithPeople, setInteractsWithPeople] = useState(false);

  // GPAI
  const [isGPAI, setIsGPAI] = useState(false);

  // Article 5
  const [usesSubliminalTechniques, setUsesSubliminalTechniques] = useState(false);
  const [exploitsVulnerabilities, setExploitsVulnerabilities] = useState(false);
  const [socialScoring, setSocialScoring] = useState(false);
  const [predictivePolicing, setPredictivePolicing] = useState(false);
  const [realTimeBiometricIdentification, setRealTimeBiometricIdentification] = useState(false);

  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!title.trim() || !sector.trim()) {
      alert("Titre et secteur requis.");
      return;
    }

    if (isAnnexeI && !annexeIDomain) {
      alert("Veuillez sélectionner le domaine réglementé (Annexe I).");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/usecases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemId,
          title,
          sector,
          role: role === "DEPLOYER" && hasModifiedSubstantially ? "BOTH" : role,
          affectsEmployment,
          affectsEducation,
          affectsEssentialServices,
          affectsJustice,
          affectsCriticalInfrastructure,
          affectsLawEnforcement,
          affectsMigration,
          affectsBorderManagement,
          isAnnexeI,
          annexeIDomain: isAnnexeI ? annexeIDomain : null,
          interactsWithPeople,
          isGPAI,
          usesSubliminalTechniques,
          exploitsVulnerabilities,
          socialScoring,
          predictivePolicing,
          realTimeBiometricIdentification,
        }),
      });

      const data = await res.json();

      if (!data?.ok) {
        if (data.error === "PROHIBITED_PRACTICE") {
          alert(
            "⚠️ Ce cas d'usage correspond à une pratique interdite par l'Article 5 de l'AI Act et ne peut pas être créé."
          );
          return;
        }
        throw new Error();
      }

      router.push(`/dashboard/systems/${systemId}`);
    } catch {
      alert("Erreur lors de la création du cas d'usage.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    padding: 14,
    borderRadius: 12,
    border: "1px solid #d1d5db",
    fontSize: 14,
    width: "100%",
  };

  const sectionStyle = {
    padding: 20,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    display: "flex",
    flexDirection: "column" as const,
    gap: 10,
  };

  const checkboxLabelStyle = {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "white",
    cursor: "pointer",
    fontSize: 14,
  };

  const ANNEXE_I_DOMAINS = [
    { value: "MACHINES", label: "Machines et équipements", detail: "Directive Machines 2006/42/CE — composants de sécurité de machines industrielles." },
    { value: "JOUETS", label: "Jouets", detail: "Directive Jouets 2009/48/CE — systèmes IA intégrés dans des jouets." },
    { value: "BATEAUX", label: "Bateaux de plaisance", detail: "Directive 2013/53/UE — embarcations de plaisance et véhicules nautiques à moteur." },
    { value: "ASCENSEURS", label: "Ascenseurs", detail: "Directive Ascenseurs 2014/33/UE — systèmes de contrôle et sécurité d'ascenseurs." },
    { value: "ATEX", label: "Équipements ATEX (atmosphères explosives)", detail: "Directive ATEX 2014/34/UE — équipements destinés à être utilisés en atmosphères explosibles." },
    { value: "RADIO", label: "Équipements radio", detail: "Directive RED 2014/53/UE — équipements radioélectriques." },
    { value: "PRESSION", label: "Équipements sous pression", detail: "Directive ESP 2014/68/UE — équipements sous pression industriels." },
    { value: "DISPOSITIFS_MEDICAUX", label: "Dispositifs médicaux", detail: "Règlement MDR 2017/745 — dispositifs médicaux diagnostics ou thérapeutiques." },
    { value: "DISPOSITIFS_MEDICAUX_DIV", label: "Dispositifs médicaux de diagnostic in vitro", detail: "Règlement IVDR 2017/746 — tests diagnostics, analyses biologiques." },
    { value: "AVIATION", label: "Aviation civile", detail: "Règlement EASA 2018/1139 — systèmes IA utilisés dans l'aviation civile." },
    { value: "VEHICULES", label: "Véhicules à moteur", detail: "Règlement 2019/2144 — systèmes IA dans les véhicules automobiles (ADAS, conduite autonome)." },
    { value: "AGRICULTURE", label: "Tracteurs et machines agricoles", detail: "Règlement 2016/1628 — engins agricoles et forestiers." },
  ];

  return (
    <div style={{ maxWidth: 800, margin: "60px auto", padding: 20 }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
        Ajouter un cas d'usage
      </h1>
      <p style={{ color: "#6b7280", marginBottom: 30, fontSize: 14 }}>
        Les réponses aux questions ci-dessous déterminent automatiquement la classification AI Act et les obligations applicables.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Infos de base */}
        <div style={sectionStyle}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Informations générales</div>
          <input
            placeholder="Titre du cas d'usage *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder="Secteur (ex: RH, Finance, Santé) *"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Rôle */}
        <div style={sectionStyle}>
          <div style={{ fontWeight: 700, marginBottom: 2 }}>
            Quel est votre rôle pour ce cas d'usage ? *
          </div>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
            Détermine les obligations légales applicables (Art. 3(3) et 3(4) AI Act).
          </div>

          {role === "DEPLOYER" && (
            <div style={{
              marginTop: 8,
              padding: 14,
              borderRadius: 10,
              border: "1px solid #fde68a",
              background: "#fffbeb",
            }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={hasModifiedSubstantially}
                  onChange={(e) => setHasModifiedSubstantially(e.target.checked)}
                  style={{ marginTop: 2 }}
                />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 2, color: "#92400e" }}>
                    ⚠️ Nous avons modifié substantiellement ce système IA
                  </div>
                  <div style={{ fontSize: 12, color: "#b45309" }}>
                    Si vous avez modifié le système au-delà de son usage prévu, vous devenez fournisseur au sens de l'AI Act. (Art. 26(3) AI Act)
                  </div>
                </div>
              </label>
            </div>
          )}

          {[
            { value: "DEPLOYER", label: "Déployeur", description: "Vous utilisez un système IA existant dans votre activité." },
            { value: "PROVIDER", label: "Fournisseur", description: "Vous développez et mettez sur le marché ce système IA." },
            { value: "BOTH", label: "Les deux (déployeur + fournisseur)", description: "Vous développez ET utilisez ce système IA." },
          ].map((option) => (
            <label
              key={option.value}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: 14,
                borderRadius: 10,
                border: `2px solid ${role === option.value ? "#111827" : "#e5e7eb"}`,
                background: role === option.value ? "#f0f9ff" : "white",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="role"
                value={option.value}
                checked={role === option.value}
                onChange={() => setRole(option.value as any)}
                style={{ marginTop: 2 }}
              />
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{option.label}</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>{option.description}</div>
              </div>
            </label>
          ))}
        </div>

        {/* Annexe III */}
        <div style={sectionStyle}>
          <div style={{ fontWeight: 700, marginBottom: 2 }}>
            Classification HIGH RISK — Annexe III AI Act
          </div>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
            Si une case est cochée, le cas d'usage sera classifié HIGH RISK.
          </div>

          {[
            { value: affectsEmployment, setter: setAffectsEmployment, label: "Emploi et gestion des travailleurs", detail: "Recrutement, sélection, promotion, licenciement, évaluation des performances. (Annexe III §4)" },
            { value: affectsEducation, setter: setAffectsEducation, label: "Éducation et formation professionnelle", detail: "Accès à l'éducation, orientation scolaire, évaluation des élèves. (Annexe III §3)" },
            { value: affectsEssentialServices, setter: setAffectsEssentialServices, label: "Accès aux services essentiels", detail: "Crédit bancaire, assurance, services publics, aide sociale. (Annexe III §5)" },
            { value: affectsJustice, setter: setAffectsJustice, label: "Justice et processus démocratiques", detail: "Aide à la décision judiciaire, arbitrage, influence sur les élections. (Annexe III §8)" },
            { value: affectsCriticalInfrastructure, setter: setAffectsCriticalInfrastructure, label: "Infrastructures critiques", detail: "Trafic routier, eau, gaz, électricité, systèmes numériques critiques. (Annexe III §2)" },
            { value: affectsLawEnforcement, setter: setAffectsLawEnforcement, label: "Forces de l'ordre", detail: "Évaluation de risque de récidive, profilage, analyse de preuves criminelles. (Annexe III §6)" },
            { value: affectsMigration, setter: setAffectsMigration, label: "Migration et asile", detail: "Évaluation des demandes d'asile, risque migratoire, aide à la décision d'expulsion. (Annexe III §7)" },
            { value: affectsBorderManagement, setter: setAffectsBorderManagement, label: "Gestion des frontières", detail: "Contrôle aux frontières, vérification biométrique, détection de menaces. (Annexe III §7)" },
          ].map((item, index) => (
            <label key={index} style={checkboxLabelStyle}>
              <input type="checkbox" checked={item.value} onChange={(e) => item.setter(e.target.checked)} style={{ marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{item.detail}</div>
              </div>
            </label>
          ))}
        </div>

        {/* Annexe I — NOUVEAU */}
        <div style={{
          ...sectionStyle,
          border: "1px solid #c7d2fe",
          background: "#eef2ff",
        }}>
          <div style={{ fontWeight: 700, marginBottom: 2, color: "#3730a3" }}>
            🏭 Classification HIGH RISK — Annexe I AI Act
          </div>
          <div style={{ fontSize: 13, color: "#4338ca", marginBottom: 8 }}>
            Un système IA est également HIGH RISK s'il est un composant de sécurité d'un produit soumis à la législation européenne listée en Annexe I. (Art. 6(1) AI Act)
          </div>

          <label style={{ ...checkboxLabelStyle, border: "1px solid #c7d2fe" }}>
            <input
              type="checkbox"
              checked={isAnnexeI}
              onChange={(e) => {
                setIsAnnexeI(e.target.checked);
                if (!e.target.checked) setAnnexeIDomain("");
              }}
              style={{ marginTop: 2 }}
            />
            <div>
              <div style={{ fontWeight: 600, marginBottom: 2, color: "#3730a3" }}>
                Ce système IA est un composant de sécurité d'un produit réglementé (Annexe I)
              </div>
              <div style={{ fontSize: 12, color: "#4338ca" }}>
                Dispositifs médicaux, véhicules, aviation, machines, ascenseurs, équipements sous pression, etc.
              </div>
            </div>
          </label>

          {isAnnexeI && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#3730a3", marginBottom: 8 }}>
                Sélectionnez le domaine réglementé *
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {ANNEXE_I_DOMAINS.map((domain) => (
                  <label
                    key={domain.value}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: 12,
                      borderRadius: 10,
                      border: `2px solid ${annexeIDomain === domain.value ? "#3730a3" : "#c7d2fe"}`,
                      background: annexeIDomain === domain.value ? "#e0e7ff" : "white",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="annexeIDomain"
                      value={domain.value}
                      checked={annexeIDomain === domain.value}
                      onChange={() => setAnnexeIDomain(domain.value)}
                      style={{ marginTop: 2 }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 2, color: "#3730a3" }}>{domain.label}</div>
                      <div style={{ fontSize: 12, color: "#4338ca" }}>{domain.detail}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Transparence */}
        <div style={sectionStyle}>
          <div style={{ fontWeight: 700, marginBottom: 2 }}>Transparence — Article 50 AI Act</div>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
            Si coché, les obligations de transparence s'appliquent.
          </div>
          <label style={checkboxLabelStyle}>
            <input type="checkbox" checked={interactsWithPeople} onChange={(e) => setInteractsWithPeople(e.target.checked)} style={{ marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>Interagit directement avec des personnes</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Chatbot, assistant IA, interface automatisée, système de recommandation personnalisée.</div>
            </div>
          </label>
        </div>

        {/* GPAI */}
        <div style={sectionStyle}>
          <div style={{ fontWeight: 700, marginBottom: 2 }}>Modèle d'IA à usage général (GPAI) — Articles 51-55 AI Act</div>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
            Modèles entraînés sur de grandes quantités de données pouvant être utilisés pour de multiples tâches.
          </div>
          <label style={checkboxLabelStyle}>
            <input type="checkbox" checked={isGPAI} onChange={(e) => setIsGPAI(e.target.checked)} style={{ marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>Ce système utilise ou est un modèle d'IA à usage général</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Des obligations spécifiques s'appliqueront (transparence, documentation technique, droits d'auteur).</div>
            </div>
          </label>
        </div>

        {/* Article 5 */}
        <div style={{ ...sectionStyle, border: "1px solid #fecaca", background: "#fff5f5" }}>
          <div style={{ fontWeight: 700, marginBottom: 2, color: "#991b1b" }}>⚠️ Pratiques interdites — Article 5 AI Act</div>
          <div style={{ fontSize: 13, color: "#b91c1c", marginBottom: 8 }}>
            Si une case est cochée, la création du cas d'usage sera bloquée.
          </div>

          {[
            { value: usesSubliminalTechniques, setter: setUsesSubliminalTechniques, label: "Techniques subliminales manipulatoires", detail: "Manipulation du comportement à l'insu de la personne. (Art. 5(1)(a))" },
            { value: exploitsVulnerabilities, setter: setExploitsVulnerabilities, label: "Exploitation de vulnérabilités", detail: "Exploitation de l'âge, du handicap ou de la situation sociale. (Art. 5(1)(b))" },
            { value: socialScoring, setter: setSocialScoring, label: "Notation sociale (social scoring)", detail: "Évaluation des personnes sur la base de leur comportement social. (Art. 5(1)(c))" },
            { value: predictivePolicing, setter: setPredictivePolicing, label: "Police prédictive individuelle", detail: "Évaluation du risque criminel basée uniquement sur le profilage. (Art. 5(1)(d))" },
            { value: realTimeBiometricIdentification, setter: setRealTimeBiometricIdentification, label: "Identification biométrique en temps réel dans l'espace public", detail: "Sauf exceptions strictement encadrées. (Art. 5(1)(h))" },
          ].map((item, index) => (
            <label key={index} style={{ ...checkboxLabelStyle, border: "1px solid #fecaca" }}>
              <input type="checkbox" checked={item.value} onChange={(e) => item.setter(e.target.checked)} style={{ marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2, color: "#991b1b" }}>{item.label}</div>
                <div style={{ fontSize: 12, color: "#b91c1c" }}>{item.detail}</div>
              </div>
            </label>
          ))}
        </div>

        <button
          onClick={handleCreate}
          disabled={loading}
          style={{
            marginTop: 10,
            padding: "16px 20px",
            borderRadius: 12,
            background: "#111827",
            color: "white",
            border: "none",
            fontWeight: 700,
            fontSize: 15,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Création en cours..." : "Créer le cas d'usage →"}
        </button>
      </div>
    </div>
  );
}