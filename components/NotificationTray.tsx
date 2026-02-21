import React from 'react';
import { Bell, BellOff, Filter, CheckCircle2 } from 'lucide-react';
import { Notification } from '@/lib/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function NotificationTray({ notifications }: { notifications: Notification[] }) {
  const visibleCount = notifications.filter(n => !n.isFiltered).length;
  const filteredCount = notifications.filter(n => n.isFiltered).length;

  return (
    <div className="bg-slate-50 border rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 bg-white border-b flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-slate-700">
          <Bell size={18} className="text-blue-600" />
          <span>Notificaciones Clínicas</span>
          <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{visibleCount}</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
          <Filter size={12} />
          <span>Filtro de Fatiga: ON</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {notifications.filter(n => !n.isFiltered).map(notif => (
          <div key={notif.id} className={cn(
            "p-3 rounded-lg border-l-4 shadow-sm bg-white",
            notif.type === 'critical' ? "border-red-500" : "border-blue-500"
          )}>
            <div className="flex justify-between items-start mb-1">
              <span className={cn(
                "text-[10px] font-black uppercase tracking-tighter",
                notif.type === 'critical' ? "text-red-600" : "text-blue-600"
              )}>
                {notif.type === 'critical' ? 'Prioridad Alta' : 'Información'}
              </span>
              <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
            </div>
            <p className="text-sm text-slate-700 font-medium">{notif.message}</p>
          </div>
        ))}

        {/* Demonstrated Filtering section */}
        <div className="pt-4 mt-4 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-2 px-1">
            <BellOff size={14} className="text-slate-400" />
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alarmas Silenciadas ({filteredCount})</h4>
          </div>
          <div className="bg-slate-200/50 rounded-lg p-3 border border-dashed border-slate-300">
             <p className="text-[10px] text-slate-500 leading-relaxed italic">
                El sistema Sof-IA ha bloqueado {filteredCount} alertas redundantes de variación no significativa para mitigar la fatiga del personal.
             </p>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-white border-t flex justify-center">
        <button className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
          <CheckCircle2 size={14} />
          Marcar todo como leído
        </button>
      </div>
    </div>
  );
}
