'use client';

import React, { useState } from 'react';
import { MOCK_PATIENTS, MOCK_NOTIFICATIONS } from '@/lib/mockData';
import { validateRecommendation } from '@/lib/sidecarLogic';
import PatientCard from '@/components/PatientCard';
import SidecarAudit from '@/components/SidecarAudit';
import NotificationTray from '@/components/NotificationTray';
import { 
  Activity, 
  Users, 
  ShieldCheck, 
  History, 
  Zap, 
  Settings, 
  Search,
  AlertTriangle,
  Stethoscope,
  Clock,
  Cpu
} from 'lucide-react';

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<'realtime' | 'retrospective'>('realtime');
  const [selectedPatientId, setSelectedPatientId] = useState('2');
  const [simulationState, setSimulationState] = useState({
    llmDose: 2,
    lastDoseHours: 1.5,
  });

  const selectedPatient = MOCK_PATIENTS.find(p => p.id === selectedPatientId) || MOCK_PATIENTS[0];
  
  const auditResult = validateRecommendation(
    selectedPatient.glucose, 
    simulationState.llmDose, 
    simulationState.lastDoseHours
  );

  const mockAudit = {
    id: 'dynamic-audit',
    patientId: selectedPatient.id,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    llmRecommendation: simulationState.llmDose > 0 
      ? `Sugerir dosis correctiva de ${simulationState.llmDose} unidades de insulina rápida.` 
      : "Continuar monitoreo pasivo.",
    guardrailStatus: auditResult.status,
    guardrailReason: auditResult.reason,
    intervention: auditResult.intervention,
    clinicalGuideline: auditResult.ruleApplied ? `Arquitectura Sof-IA: ${auditResult.ruleApplied}` : 'Protocolo Estándar GPC'
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      <header className="bg-slate-900 text-white p-4 shadow-xl border-b-4 border-blue-500 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Activity className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter flex items-center gap-2">
                Sof-IA <span className="text-blue-400 text-xs bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20">PoC v1.2</span>
              </h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Telemonitoreo Rural Autónomo-Asistido</p>
            </div>
          </div>

          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button onClick={() => setViewMode('retrospective')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'retrospective' ? 'bg-slate-600 text-white shadow-inner' : 'text-slate-400 hover:text-white'}`}>
              <History size={14} /> VISTA RETROSPECTIVA
            </button>
            <button onClick={() => setViewMode('realtime')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'realtime' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
              <Zap size={14} /> VISTA AUTÓNOMA ASISTIDA
            </button>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck size={16} />
              SIDECAR ACTIVE
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-3 flex flex-col gap-4">
          <h2 className="font-black text-sm uppercase tracking-wider flex items-center gap-2 px-1">
            <Users size={18} className="text-blue-600" /> Triaje en Tiempo Real
          </h2>
          <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-180px)] pr-2 scrollbar-hide">
            {MOCK_PATIENTS.map(patient => (
              <div key={patient.id} onClick={() => setSelectedPatientId(patient.id)} className="cursor-pointer">
                <PatientCard patient={patient} isSelected={selectedPatientId === patient.id} />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800">{selectedPatient.name}</h2>
              <span className="text-[10px] font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-500 uppercase">Paciente {selectedPatient.id}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-900 text-white p-4 rounded-xl">
                <span className="text-[10px] font-bold text-blue-400 uppercase block mb-1">Glucosa Actual</span>
                <div className="text-3xl font-black">{selectedPatient.glucose} <span className="text-xs">mg/dL</span></div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Insulina Activa</span>
                <div className="flex items-center gap-2 font-black text-slate-700">
                   <Clock size={16} className="text-blue-500" />
                   {simulationState.lastDoseHours}h
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">TIR (24h)</span>
                <div className="text-xl font-black text-slate-700">{selectedPatient.tir}%</div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
              <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Cpu size={14} /> Simulador de Intervención (Prueba de Estrés Sidecar)
              </h3>
              <div className="flex gap-6">
                <div className="flex-1">
                   <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Dosis sugerida por LLM (unidades)</label>
                   <input 
                    type="range" min="0" max="50" step="1" 
                    value={simulationState.llmDose}
                    onChange={(e) => setSimulationState({...simulationState, llmDose: parseInt(e.target.value)})}
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                   />
                   <div className="flex justify-between text-[10px] font-bold text-blue-600 mt-1">
                      <span>0u</span>
                      <span className="bg-blue-600 text-white px-2 rounded">{simulationState.llmDose}u</span>
                      <span>50u</span>
                   </div>
                </div>
                <div className="flex-1">
                   <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Tiempo desde última dosis</label>
                   <input 
                    type="range" min="0" max="5" step="0.5" 
                    value={simulationState.lastDoseHours}
                    onChange={(e) => setSimulationState({...simulationState, lastDoseHours: parseFloat(e.target.value)})}
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                   />
                   <div className="flex justify-between text-[10px] font-bold text-blue-600 mt-1">
                      <span>0h</span>
                      <span className="bg-blue-600 text-white px-2 rounded">{simulationState.lastDoseHours}h</span>
                      <span>5h</span>
                   </div>
                </div>
              </div>
            </div>

            {viewMode === 'realtime' ? (
              <SidecarAudit audit={mockAudit as any} />
            ) : (
              <div className="p-8 border-2 border-dashed border-amber-200 bg-amber-50 rounded-xl text-center">
                 <History size={40} className="mx-auto text-amber-400 mb-2" />
                 <p className="font-bold text-amber-800 uppercase text-xs tracking-widest">Modo Histórico: Sin Protección Sidecar</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col gap-6">
           <NotificationTray notifications={MOCK_NOTIFICATIONS} />
           
           <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Malla de Reglas Deterministas</h3>
              <div className="space-y-4">
                 {[
                   { id: '1', name: 'Bloqueo Hipoglucemia', active: true },
                   { id: '2', name: 'Prevención Stacking', active: true },
                   { id: '3', name: 'Tope Máximo de Dosis', active: true },
                   { id: '4', name: 'Alerta CAD Sostenida', active: true }
                 ].map(rule => (
                   <div key={rule.id} className="flex items-center justify-between p-2 rounded bg-slate-800 border border-slate-700">
                      <span className="text-[10px] font-bold">R{rule.id}: {rule.name}</span>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                   </div>
                 ))}
              </div>
           </div>
        </div>

      </main>
    </div>
  );
}
