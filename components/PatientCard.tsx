import React from 'react';
import { Patient } from '@/lib/types';
import { TrendingUp, TrendingDown, Minus, MapPin, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function PatientCard({ patient, isSelected, history = [] }: { patient: Patient, isSelected?: boolean, history?: { time: string, glucose: number }[] }) {
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
          <div className={cn(
            "w-12 h-12 rounded-2xl flex flex-col items-center justify-center text-white font-black shadow-inner",
            getStatusColor(patient.status)
          )}>
            <span className="text-lg leading-none">{patient.glucose}</span>
            <span className="text-[8px] uppercase tracking-widest mt-0.5 flex items-center justify-center w-full">
              {patient.trend === 'up' && <TrendingUp size={10} className="stroke-[4px]" />}
              {patient.trend === 'down' && <TrendingDown size={10} className="stroke-[4px]" />}
              {patient.trend === 'stable' && <Minus size={10} className="stroke-[4px]" />}
            </span>
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-sm leading-tight group-hover:text-blue-600 transition-colors pt-1">{patient.name}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-1">
              <MapPin size={10} /> {patient.location}
            </p>
          </div>
        </div>
        <div className="text-slate-200 group-hover:text-blue-500 transition-all group-hover:translate-x-1 mt-2">
          <ChevronRight size={20} />
        </div>
      </div>

      <div className="flex items-center gap-4 mt-2">
        <div className="flex-1 h-8 bg-slate-50/50 rounded-lg overflow-hidden relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <YAxis domain={['auto', 'auto']} hide />
              <Area type="monotone" dataKey="glucose" stroke={patient.status === 'critical' ? '#ef4444' : patient.status === 'warning' ? '#fbbf24' : '#2563eb'} fillOpacity={0.1} fill={patient.status === 'critical' ? '#ef4444' : patient.status === 'warning' ? '#fbbf24' : '#2563eb'} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
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
