import React from 'react';
import { ShieldCheck, ShieldAlert, BookOpen, Cpu, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuditLog } from '@/lib/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function SidecarAudit({ audit }: { audit: AuditLog }) {
  const isBlocked = audit.guardrailStatus === 'blocked';

  return (
    <div className="bg-slate-50 rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-inner">
      <div className={cn(
        "px-8 py-6 flex items-center justify-between",
        isBlocked ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
      )}>
        <div className="flex items-center gap-3">
          {isBlocked ? <ShieldAlert size={24} /> : <ShieldCheck size={24} />}
          <span className="font-black text-sm uppercase tracking-widest">Validación Sidecar</span>
        </div>
        <span className="text-[10px] font-black opacity-80 uppercase tracking-widest">{audit.timestamp}</span>
      </div>

      <div className="p-8 space-y-8">
        <div>
           <div className="flex items-center gap-2 mb-3">
              <Cpu size={16} className="text-slate-400" />
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entrada del Modelo (LLM)</h4>
           </div>
           <p className="text-slate-700 font-bold text-lg italic leading-relaxed">
              "{audit.llmRecommendation}"
           </p>
        </div>

        <div className="h-px bg-slate-200 border-dashed" />

        <div>
           <div className="flex items-center gap-2 mb-4">
              {isBlocked ? <ShieldAlert size={16} className="text-red-500" /> : <ShieldCheck size={16} className="text-emerald-500" />}
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Decisión Algorítmica</h4>
           </div>
           
           <div className={cn(
             "p-6 rounded-3xl border-2",
             isBlocked ? "bg-red-50 border-red-100 text-red-900" : "bg-emerald-50 border-emerald-100 text-emerald-900"
           )}>
              <div className="flex items-start gap-4">
                 <div className={cn("mt-1", isBlocked ? "text-red-500" : "text-emerald-500")}>
                    {isBlocked ? <XCircle size={20} /> : <CheckCircle2 size={20} />}
                 </div>
                 <div>
                    <p className="font-black uppercase text-xs tracking-tighter mb-1">
                       {isBlocked ? 'Acción Bloqueada: Riesgo Detectado' : 'Acción Aprobada: Cumple Guía Clínica'}
                    </p>
                    <p className="text-sm font-medium opacity-80 leading-relaxed">
                       {audit.guardrailReason || 'La recomendación se encuentra dentro de los rangos de bioseguridad establecidos para el gemelo digital.'}
                    </p>
                 </div>
              </div>
           </div>

           {isBlocked && audit.intervention && (
             <div className="mt-4 p-6 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-200">
                <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2 flex items-center gap-2">
                   <AlertCircle size={14} /> Intervención Forzada
                </p>
                <p className="font-bold text-sm leading-relaxed">{audit.intervention}</p>
             </div>
           )}
        </div>

        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 bg-white border border-slate-100 p-3 rounded-xl w-fit">
          <BookOpen size={14} />
          <span>REF: {audit.clinicalGuideline}</span>
        </div>
      </div>
    </div>
  );
}

function XCircle({ size, className }: { size?: number, className?: string }) {
   return (
     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
       <circle cx="12" cy="12" r="10" />
       <path d="m15 9-6 6" />
       <path d="m9 9 6 6" />
     </svg>
   )
}
