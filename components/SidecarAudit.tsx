import React from 'react';
import { ShieldCheck, ShieldAlert, BookOpen, Cpu, AlertCircle } from 'lucide-react';
import { AuditLog } from '@/lib/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function SidecarAudit({ audit }: { audit: AuditLog }) {
  const isBlocked = audit.guardrailStatus === 'blocked';

  return (
    <div className="border rounded-lg bg-white overflow-hidden shadow-sm mb-4">
      <div className={cn(
        "px-4 py-2 flex items-center justify-between text-white font-bold",
        isBlocked ? "bg-red-600" : "bg-emerald-600"
      )}>
        <div className="flex items-center gap-2">
          {isBlocked ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
          <span>AUDITORÍA DE IA - LIMITADOR DETERMINISTA (SIDECAR)</span>
        </div>
        <span className="text-xs opacity-90">{audit.timestamp}</span>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex gap-3">
          <div className="mt-1 text-slate-400">
            <Cpu size={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recomendación Generada (LLM)</h4>
            <p className="text-slate-700 italic">"{audit.llmRecommendation}"</p>
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        <div className="flex gap-3">
          <div className={cn("mt-1", isBlocked ? "text-red-500" : "text-emerald-500")}>
            <ShieldCheck size={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Validación de Bioseguridad Algorítmica</h4>
            <div className={cn(
              "mt-1 px-3 py-2 rounded border-l-4 font-medium text-sm",
              isBlocked ? "bg-red-50 border-red-500 text-red-700" : "bg-emerald-50 border-emerald-500 text-emerald-700"
            )}>
              {isBlocked ? (
                <>
                  <span className="font-bold uppercase block text-[10px] mb-1">Motivo del Bloqueo:</span>
                  {audit.guardrailReason}
                </>
              ) : (
                <>
                  <span className="font-bold">APROBADO: </span>
                  La recomendación cumple con los protocolos de seguridad.
                </>
              )}
            </div>
            
            {audit.intervention && (
              <div className="mt-3 bg-blue-50 border-l-4 border-blue-500 p-3 rounded text-blue-800 text-sm">
                 <div className="flex items-center gap-2 font-bold uppercase text-[10px] mb-1">
                    <AlertCircle size={14} />
                    Intervención Forzada del Sidecar:
                 </div>
                 {audit.intervention}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded">
          <BookOpen size={14} />
          <span>Referencia: <span className="font-semibold">{audit.clinicalGuideline}</span></span>
        </div>
      </div>
    </div>
  );
}
