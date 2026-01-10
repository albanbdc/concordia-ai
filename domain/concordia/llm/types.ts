// src/domain/concordia/llm/types.ts

export type LlmInterpretation = {
  prohibitedSignal: boolean;
  highRiskSignal: boolean;

  biometricSignal: boolean;
  lawEnforcementSignal: boolean;
  vulnerablePersonsSignal: boolean;

  justification: string;
};

export const EMPTY_INTERPRETATION: LlmInterpretation = {
  prohibitedSignal: false,
  highRiskSignal: false,
  biometricSignal: false,
  lawEnforcementSignal: false,
  vulnerablePersonsSignal: false,
  justification: "",
};
