export interface SidecarRule {
  id: string;
  name: string;
  description: string;
}

export const SIDECAR_RULES: SidecarRule[] = [
  {
    id: 'RULE_1',
    name: 'Bloqueo Estrictos por Hipoglucemia',
    description: 'Bloqueo de insulina y activación de la "Regla de los 15" si glucosa < 70 mg/dL.'
  },
  {
    id: 'RULE_2',
    name: 'Prevención de Apilamiento (Stacking)',
    description: 'Bloqueo de bolos de corrección si la última dosis fue hace menos de 3 horas.'
  },
  {
    id: 'RULE_3',
    name: 'Tope Máximo de Dosis',
    description: 'Filtro anti-alucinación que trunca dosis > 10 unidades.'
  },
  {
    id: 'RULE_4',
    name: 'Crisis Hiperglucémica Sostenida',
    description: 'Escalamiento inmediato por riesgo de CAD si > 250 mg/dL por 3h.'
  }
];

export function validateRecommendation(patientGlucose: number, llmDose: number, lastDoseHours: number): {
  status: 'passed' | 'blocked';
  reason?: string;
  ruleApplied?: string;
  intervention?: string;
} {
  // REGLA 1: Hipoglucemia
  if (patientGlucose < 70) {
    if (llmDose > 0) {
      return {
        status: 'blocked',
        ruleApplied: 'REGLA 1',
        reason: `Glucosa de ${patientGlucose} mg/dL. Contraindicación absoluta de insulina.`,
        intervention: 'Iniciar "Regla de los 15": 15g carbohidratos rápidos. Reevaluar en 15 min.'
      };
    }
  }

  // REGLA 3: Tope Máximo (Prioritaria sobre stacking para evitar letalidad inmediata)
  if (llmDose > 10) {
    return {
      status: 'blocked',
      ruleApplied: 'REGLA 3',
      reason: `Dosis de ${llmDose} unidades excede el límite de seguridad (10u).`,
      intervention: 'ERROR CRÍTICO INTERCEPTADO. Requiere validación manual del médico (Human-in-the-Loop).'
    };
  }

  // REGLA 2: Insulin Stacking
  if (llmDose > 0 && lastDoseHours < 3) {
    return {
      status: 'blocked',
      ruleApplied: 'REGLA 2',
      reason: `Insulina activa detectada (Última dosis hace ${lastDoseHours}h).`,
      intervention: 'Alerta: Riesgo de Apilamiento. Recalcular restando insulina residual.'
    };
  }

  // REGLA 4: Hiperglucemia Sostenida (Informativa/Escalamiento)
  if (patientGlucose > 250) {
    return {
      status: 'passed',
      ruleApplied: 'REGLA 4',
      intervention: 'ALERTA: Riesgo de CAD. Notificar a profesional asistencial de inmediato.'
    };
  }

  return { status: 'passed' };
}
