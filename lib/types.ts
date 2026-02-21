export interface Patient {
  id: string;
  name: string;
  age: number;
  location: string;
  glucose: number;
  trend: 'up' | 'down' | 'stable';
  tir: number;
  status: 'critical' | 'warning' | 'stable';
  lastUpdate: string;
  clinicalHistory?: string;
  currentMedication?: string[];
  lastExamDate?: string;
}

export interface AuditLog {
  id: string;
  patientId: string;
  timestamp: string;
  llmRecommendation: string;
  guardrailStatus: 'passed' | 'blocked';
  guardrailReason?: string;
  clinicalGuideline: string;
  intervention?: string;
}

export interface Notification {
  id: string;
  patientId: string;
  type: 'alert' | 'info' | 'critical';
  message: string;
  timestamp: string;
  isFiltered: boolean;
}

export interface AppState {
  currentView: 'home' | 'patients' | 'audit' | 'settings' | 'profile';
  selectedPatientId?: string;
  isLoggedIn: boolean;
  sidecarThresholds: {
    maxInsulinDose: number;
    hypoThreshold: number;
    hyperThreshold: number;
    stackingHours: number;
  };
}
