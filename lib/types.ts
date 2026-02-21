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
