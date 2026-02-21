import React from 'react';
import { Patient } from '@/lib/types';
import { TrendingUp, TrendingDown, Minus, MapPin, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function PatientCard({ patient, isSelected }: { patient: Patient, isSelected?: boolean }) {
  const getStatusColor = (status: Patient['status']) => {
    switch (status) {
      case 'critical': return 'bg-red-500 text-white';
      case 'warning': return 'bg-amber-400 text-white';
      default: return 'bg-emerald-500 text-white';
    }
  };

  return (
    <div className={cn(
      "p-5 border-2 rounded-[2rem] transition-all relative overflow-hidden group shadow-sm",
      isSelected ? "border-blue-600 bg-white shadow-xl shadow-blue-100/50 scale-[1.02]" : "border-white bg-white hover:border-slate-100"
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3">
           <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm", getStatusColor(patient.status))}>
              {patient.glucose}
           </div>
           <div>
              <h3 className="font-black text-slate-800 text-sm leading-tight group-hover:text-blue-600 transition-colors">{patient.name}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{patient.location}</p>
           </div>
        </div>
        <div className="text-slate-300 group-hover:text-blue-600 transition-all group-hover:translate-x-1">
           <ChevronRight size={20} />
        </div>
      </div>

      <div className="flex items-center gap-4">
         <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${patient.tir}%` }} />
         </div>
         <span className="text-[10px] font-black text-slate-500">{patient.tir}% TIR</span>
      </div>
      
      {isSelected && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600/5 rounded-bl-[3rem] -mr-4 -mt-4" />
      )}
    </div>
  );
}
