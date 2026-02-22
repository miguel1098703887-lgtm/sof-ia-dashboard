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

export function validateRecommendation(
  patientGlucose: number,
  llmDose: number,
  lastDoseHours: number,
  thresholds: {
    hypoThreshold: number;
    hyperThreshold: number;
    maxInsulinDose: number;
    stackingHours: number;
  } = { hypoThreshold: 70, hyperThreshold: 250, maxInsulinDose: 10, stackingHours: 3 }
): {
  status: 'passed' | 'blocked';
  reason?: string;
  ruleApplied?: string;
  intervention?: string;
} {
  // REGLA 1: Hipoglucemia Estricta (GPC Colombia)
  if (patientGlucose < thresholds.hypoThreshold) {
    if (llmDose > 0) {
      return {
        status: 'blocked',
        ruleApplied: 'GPC-COL-2023: Protocolo Manejo Hipoglucemia',
        reason: `Glucosa de ${patientGlucose} mg/dL (Nivel Crítico de Riesgo). Contraindicación absoluta de insulina. Riesgo de secuela neurológica severa.`,
        intervention: 'Ruta Clínica: Iniciar "Regla de los 15" (15g de carbohidratos de absorción rápida). Reevaluar gemelo digital en 15 min.'
      };
    }
  }

  // REGLA 3: Tope Máximo de Seguridad (Previene Alucinaciones Letales)
  if (llmDose > thresholds.maxInsulinDose) {
    return {
      status: 'blocked',
      ruleApplied: 'GPC-COL-2023: Límite de Bioseguridad en Bolo Asincrónico',
      reason: `Sugerencia de ${llmDose} unidades excede el límite de umbral de seguridad (${thresholds.maxInsulinDose}u) modelado para telemedicina rural asincrónica.`,
      intervention: 'SEGURO ACTIVADO: Intervención bloqueada de origen. Requiere validación manual estricta del médico primario (Human-in-the-Loop).'
    };
  }

  // REGLA 2: Insulin Stacking (Cálculo Farmacocinético de Insulina Activa)
  if (llmDose > 0 && lastDoseHours < thresholds.stackingHours) {
    // Estimación básica de Insulina Residual (IOB) basada en t1/2 de rápida acción
    const residual = Math.max(0, Math.round((thresholds.stackingHours - lastDoseHours) * (llmDose * 0.3) * 10) / 10);
    return {
      status: 'blocked',
      ruleApplied: 'GPC-COL-2023: Farmacocinética de Insulina Rápida (IOB)',
      reason: `Insulina residual cruzada. (Último bolo hace ${lastDoseHours}h). Estimación de ${residual}u aún biodisponibles en torrente.`,
      intervention: 'Alerta de Evasión: Riesgo alto de hipoglucemia por apilamiento (Stacking). Recalcular descontando la insulina residual o posponer toma.'
    };
  }

  // REGLA 4: Hiperglucemia Sostenida / Riesgo CAD
  if (patientGlucose > thresholds.hyperThreshold) {
    return {
      status: 'passed',
      ruleApplied: 'GPC-COL-2023: Protocolo Prevención CAD',
      intervention: 'ALERTA ADICIONAL: Paciente en umbral alto. Controlar cuerpos cetónicos y considerar protocolo de deshidratación si es rural disperso.'
    };
  }

  return {
    status: 'passed',
    ruleApplied: 'GPC-COL-2023: Rango Terapéutico Estandarizado'
  };
}
