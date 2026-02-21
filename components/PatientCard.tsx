import React from 'react';
import { Patient } from '@/lib/types';
import { TrendingUp, TrendingDown, Minus, MapPin, Activity } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function PatientCard({ patient, isSelected }: { patient: Patient, isSelected?: boolean }) {
  const getStatusColor = (status: Patient['status']) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'warning': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  const getGlucoseColor = (glucose: number) => {
    if (glucose < 70 || glucose > 250) return 'text-red-600';
    if (glucose > 180) return 'text-amber-600';
    return 'text-emerald-600';
  };

  return (
    <div className={cn(
      "p-4 border-2 rounded-xl transition-all cursor-pointer hover:shadow-md",
      isSelected ? "border-blue-500 bg-blue-50/30" : "border-slate-100 bg-white"
    )}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-slate-800 leading-tight">{patient.name}</h3>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
            <MapPin size={12} />
            <span>{patient.location} • {patient.age} años</span>
          </div>
        </div>
        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border", getStatusColor(patient.status))}>
          {patient.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Glucosa</span>
          <div className="flex items-end gap-1">
            <span className={cn("text-2xl font-black leading-none", getGlucoseColor(patient.glucose))}>
              {patient.glucose}
            </span>
            <span className="text-[10px] text-slate-400 font-bold mb-1">mg/dL</span>
            <div className="mb-1 ml-1">
              {patient.trend === 'up' && <TrendingUp size={16} className="text-red-500" />}
              {patient.trend === 'down' && <TrendingDown size={16} className="text-blue-500" />}
              {patient.trend === 'stable' && <Minus size={16} className="text-slate-400" />}
            </div>
          </div>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase block">TIR (Rango)</span>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-black leading-none text-slate-700">
              {patient.tir}%
            </span>
            <div className="w-full h-1 bg-slate-100 rounded-full mt-2 relative overflow-hidden">
               <div className="absolute left-0 top-0 h-full bg-emerald-500" style={{ width: `${patient.tir}%` }} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center">
        <div className="flex items-center gap-1 text-[10px] text-slate-400 italic">
          <Activity size={10} />
          <span>Actualizado: {patient.lastUpdate}</span>
        </div>
      </div>
    </div>
  );
}
