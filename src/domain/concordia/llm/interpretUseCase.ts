// src/domain/concordia/llm/interpretUseCase.ts

import { EMPTY_INTERPRETATION, type LlmInterpretation } from "./types";
import { LLM_CASES } from "./cases";

/**
 * On injecte quelques cas de référence (few-shot)
 * pour caler l'interprétation du LLM sur NOS standards.
 */
function buildPrompt(freeText: string) {
  const examples = LLM_CASES.slice(0, 5) // on commence avec 5 cas max
    .map(
      (c, idx) => `
Exemple ${idx + 1}
Texte :
"${c.input}"

Résultat attendu (JSON) :
${JSON.stringify(c.expected)}
`.trim()
    )
    .join("\n\n");

  return `
Tu es un assistant conformité spécialisé dans l'EU AI Act.

Voici des exemples de cas DE RÉFÉRENCE.
Ils définissent comment interpréter un cas d’usage.

${examples}

--- FIN DES EXEMPLES ---

Maintenant, analyse le cas suivant.

Cas d’usage :
"""
${freeText}
"""

Réponds UNIQUEMENT en JSON valide (pas de texte autour),
avec exactement ces clés :
{
  "prohibitedSignal": boolean,
  "highRiskSignal": boolean,
  "biometricSignal": boolean,
  "lawEnforcementSignal": boolean,
  "vulnerablePersonsSignal": boolean,
  "justification": string
}

Règles :
- Si le cas ressemble fortement à un exemple interdit → prohibitedSignal = true
- Si le cas ressemble fortement à un exemple high-risk → highRiskSignal = true
- justification : 1 à 2 phrases max, en français.
`.trim();
}

function safeParseJson(text: string): any | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function normalizeInterpretation(raw: any): LlmInterpretation {
  const toBool = (v: any) => v === true;

  if (!raw || typeof raw !== "object") return EMPTY_INTERPRETATION;

  return {
    prohibitedSignal: toBool(raw.prohibitedSignal),
    highRiskSignal: toBool(raw.highRiskSignal),
    biometricSignal: toBool(raw.biometricSignal),
    lawEnforcementSignal: toBool(raw.lawEnforcementSignal),
    vulnerablePersonsSignal: toBool(raw.vulnerablePersonsSignal),
    justification:
      typeof raw.justification === "string" ? raw.justification.slice(0, 400) : "",
  };
}

export async function interpretUseCaseWithLLM(params: {
  freeText: string;
  requestId: string;
}): Promise<LlmInterpretation> {
  const { freeText, requestId } = params;

  if (!freeText || freeText.trim().length < 10) {
    return EMPTY_INTERPRETATION;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn(`[llm][${requestId}] OPENAI_API_KEY manquante → skip`);
    return EMPTY_INTERPRETATION;
  }

  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: buildPrompt(freeText),
        text: { format: { type: "json_object" } },
        store: false,
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error(`[llm][${requestId}] OpenAI HTTP ${res.status}`, txt);
      return EMPTY_INTERPRETATION;
    }

    const data: any = await res.json();
    const outputText: string | undefined =
      typeof data?.output_text === "string" ? data.output_text : undefined;

    if (!outputText) {
      console.error(`[llm][${requestId}] Pas de output_text`);
      return EMPTY_INTERPRETATION;
    }

    const raw = safeParseJson(outputText);
    if (!raw) {
      console.error(`[llm][${requestId}] JSON invalide`, outputText);
      return EMPTY_INTERPRETATION;
    }

    return normalizeInterpretation(raw);
  } catch (e: any) {
    console.error(`[llm][${requestId}] Exception`, e?.message ?? String(e));
    return EMPTY_INTERPRETATION;
  }
}
