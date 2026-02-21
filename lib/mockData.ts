import { Patient, Notification, AuditLog } from './types';

export const MOCK_PATIENTS: Patient[] = [
  { id: '1', name: 'Rosa Elvira Duarte', age: 68, location: 'Onzaga (Rural)', glucose: 245, trend: 'up', tir: 65, status: 'warning', lastUpdate: 'Ahora' },
  { id: '2', name: 'Luis Alberto Gómez', age: 72, location: 'San Joaquín', glucose: 62, trend: 'down', tir: 40, status: 'critical', lastUpdate: 'Hace 2 min' },
  { id: '3', name: 'María Inés Castro', age: 55, location: 'Mogotes', glucose: 110, trend: 'stable', tir: 92, status: 'stable', lastUpdate: 'Hace 5 min' },
  { id: '4', name: 'Campo Elías Rojas', age: 80, location: 'Onzaga (Vereda)', glucose: 310, trend: 'up', tir: 30, status: 'critical', lastUpdate: 'Ahora' },
  { id: '5', name: 'Gloria Esperanza', age: 64, location: 'Enciso', glucose: 145, trend: 'up', tir: 78, status: 'stable', lastUpdate: 'Hace 10 min' },
  { id: '6', name: 'Héctor Fabio Ruiz', age: 49, location: 'Cepitá', glucose: 85, trend: 'stable', tir: 88, status: 'stable', lastUpdate: 'Hace 1 min' },
  { id: '7', name: 'Tránsito Amado', age: 75, location: 'Onzaga (Centro)', glucose: 195, trend: 'down', tir: 55, status: 'warning', lastUpdate: 'Hace 4 min' },
  { id: '8', name: 'Juvenal Silva', age: 67, location: 'Molinagote', glucose: 74, trend: 'down', tir: 60, status: 'warning', lastUpdate: 'Ahora' },
  { id: '9', name: 'Blanca Nieves', age: 59, location: 'San Joaquín', glucose: 128, trend: 'stable', tir: 95, status: 'stable', lastUpdate: 'Hace 8 min' },
  { id: '10', name: 'Ricardo Santos', age: 71, location: 'Onzaga (Rural)', glucose: 55, trend: 'down', tir: 35, status: 'critical', lastUpdate: 'Ahora' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', patientId: '2', type: 'critical', message: 'Hipoglucemia detectada (62 mg/dL)', timestamp: '15:58', isFiltered: false },
  { id: 'n2', patientId: '4', type: 'critical', message: 'Hiperglucemia severa (310 mg/dL)', timestamp: '15:57', isFiltered: false },
  { id: 'n3', patientId: '1', type: 'info', message: 'Glucosa subiendo levemente (245)', timestamp: '15:55', isFiltered: true }, // Bloqueada por fatiga
  { id: 'n4', patientId: '1', type: 'info', message: 'Glucosa subiendo levemente (242)', timestamp: '15:50', isFiltered: true }, // Bloqueada por fatiga
];

export const MOCK_AUDITS: AuditLog[] = [
  {
    id: 'a1',
    patientId: '2',
    timestamp: '15:58',
    llmRecommendation: 'Sugerir dosis correctiva de 2 unidades de insulina rápida.',
    guardrailStatus: 'blocked',
    guardrailReason: 'Riesgo de iatrogenia: El paciente está en Hipoglucemia (<70 mg/dL). Contraindicación absoluta de insulina.',
    clinicalGuideline: 'GPC Diabetes Colombia (2023) - Manejo de Hipoglucemia'
  },
  {
    id: 'a2',
    patientId: '4',
    timestamp: '15:57',
    llmRecommendation: 'Recomendar hidratación oral y contacto inmediato con centro de salud.',
    guardrailStatus: 'passed',
    clinicalGuideline: 'GPC Diabetes Colombia (2023) - Hiperglucemia >300 mg/dL'
  }
];
