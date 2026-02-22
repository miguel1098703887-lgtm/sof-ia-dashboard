import React, { useState } from 'react';
import { Bell, BellOff, Filter, CheckCircle2 } from 'lucide-react';
import { Notification } from '@/lib/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function NotificationTray({ notifications: initialNotifications }: { notifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filterOn, setFilterOn] = useState(true);

  const visibleCount = notifications.filter(n => filterOn ? !n.isFiltered : true).length;
  const filteredCount = initialNotifications.filter(n => n.isFiltered).length;

  return (
    <div className="bg-slate-50 border rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 bg-white border-b flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-slate-700">
          <Bell size={18} className="text-blue-600" />
          <span>Notificaciones Clínicas</span>
          <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{visibleCount}</span>
        </div>
        <button
          onClick={() => setFilterOn(!filterOn)}
          className={cn(
            "flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border",
            filterOn ? "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100" : "text-slate-500 bg-slate-100 border-slate-200 hover:bg-slate-200"
          )}>
          <Filter size={12} />
          <span>Filtro de Fatiga: {filterOn ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {notifications.filter(n => filterOn ? !n.isFiltered : true).map(notif => (
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
        {filterOn && filteredCount > 0 && (
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
        )}

        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center p-10 text-slate-400 h-full">
            <CheckCircle2 size={32} className="mb-2 opacity-50 text-emerald-500" />
            <p className="text-sm font-bold">Sin notificaciones pendientes</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t flex justify-center">
        {notifications.length > 0 ? (
          <button
            onClick={() => setNotifications([])}
            className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:text-blue-700 hover:underline px-4 py-2 rounded-lg transition-all active:scale-95"
          >
            <CheckCircle2 size={14} />
            Marcar todo como leído
          </button>
        ) : (
          <span className="text-xs font-bold text-slate-400">Todo revisado</span>
        )}
      </div>
    </div>
  );
}
