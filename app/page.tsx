'use client';

import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Home, 
  Users, 
  ShieldCheck, 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Menu, 
  X, 
  Search,
  ChevronRight,
  LogOut,
  Plus,
  AlertCircle
} from 'lucide-react';
import { MOCK_PATIENTS as INITIAL_MOCK_PATIENTS, MOCK_NOTIFICATIONS } from '@/lib/mockData';
import { validateRecommendation } from '@/lib/sidecarLogic';
import PatientCard from '@/components/PatientCard';
import SidecarAudit from '@/components/SidecarAudit';
import NotificationTray from '@/components/NotificationTray';

// Main Application Component
export default function SofIAApp() {
  const [currentView, setCurrentView] = useState<'home' | 'patients' | 'audit' | 'settings'>('home');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [patients, setPatients] = useState(INITIAL_MOCK_PATIENTS);
  const [history, setHistory] = useState<Record<string, { time: string, glucose: number }[]>>({});
  
  // Login State
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  
  // Simulation for Audit logic
  const [llmDose, setLlmDose] = useState(2);
  const [lastDoseHours, setLastDoseHours] = useState(1.5);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  // Glucose Simulation Effect
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      setPatients(prevPatients => prevPatients.map(patient => {
        // Random walk for glucose
        let change = Math.floor(Math.random() * 7) - 3; // -3 to +3
        
        // Add tendency logic
        if (patient.trend === 'up') change += 1;
        if (patient.trend === 'down') change -= 1;

        let newGlucose = patient.glucose + change;
        
        // Bounds
        if (newGlucose < 40) newGlucose = 40;
        if (newGlucose > 450) newGlucose = 450;

        // Update status based on new glucose
        let newStatus = patient.status;
        if (newGlucose < 70 || newGlucose > 250) {
          newStatus = 'critical';
        } else if (newGlucose < 90 || newGlucose > 180) {
          newStatus = 'warning';
        } else {
          newStatus = 'stable';
        }

        // Update trend occasionally
        let newTrend = patient.trend;
        if (Math.random() > 0.9) {
          const trends: ('up' | 'down' | 'stable')[] = ['up', 'down', 'stable'];
          newTrend = trends[Math.floor(Math.random() * trends.length)];
        }

        // Update history
        const now = new Date();
        const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        
        setHistory(prev => {
          const patientHistory = prev[patient.id] || [];
          const newHistory = [...patientHistory, { time: timeStr, glucose: newGlucose }].slice(-20); // Keep last 20 points
          return { ...prev, [patient.id]: newHistory };
        });

        return {
          ...patient,
          glucose: newGlucose,
          status: newStatus,
          trend: newTrend,
          lastUpdate: 'Ahora'
        };
      }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Authentication Guard (Simulated)
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-center mb-6">
             <div className="bg-blue-600 p-4 rounded-2xl">
                <ShieldCheck className="text-white" size={40} />
             </div>
          </div>
          <h1 className="text-3xl font-black text-center text-slate-900 tracking-tighter mb-2">Sof-IA Portal</h1>
          <p className="text-center text-slate-500 text-sm mb-8 uppercase font-bold tracking-widest">Acceso Clínico Bio-Seguro</p>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Identificación Médica</label>
              <input 
                type="text" 
                placeholder="ID Registro" 
                className="w-full mt-1 p-4 bg-white border-2 border-slate-300 rounded-xl outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-600 transition-all font-black text-[18px] text-black block placeholder:text-slate-400" 
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Contraseña</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full mt-1 p-4 bg-white border-2 border-slate-300 rounded-xl outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-600 transition-all font-black text-[18px] text-black block placeholder:text-slate-400" 
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
              />
            </div>
            <button 
              onClick={() => {
                if (loginId === 'DR-JOHANA-2026' && loginPass === 'password') {
                  setIsLoggedIn(true);
                } else {
                  alert('Credenciales incorrectas. Verifique ID y Contraseña.');
                }
              }}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              INGRESAR AL SISTEMA
            </button>
            <button 
              onClick={() => { setLoginId('DR-JOHANA-2026'); setLoginPass('password'); }}
              className="w-full text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 hover:text-blue-500 transition-colors"
            >
              Usar Credenciales de Prueba
            </button>
          </div>
          <p className="mt-8 text-[10px] text-center text-slate-400 font-medium">
            SISTEMA CERTIFICADO SaMD CLASS IIa <br/> © 2026 PROYECTO SOF-IA
          </p>
        </div>
      </div>
    );
  }

  // Navigation Data
  const navItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'audit', label: 'Auditoría IA', icon: ShieldCheck },
    { id: 'settings', label: 'Ajustes GPC', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 bg-slate-900 flex-col border-r border-slate-800 sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center gap-3">
             <div className="bg-blue-600 p-2 rounded-lg">
                <ShieldCheck className="text-white" size={24} />
             </div>
             <h1 className="text-2xl font-black text-white tracking-tighter">Sof-IA</h1>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setCurrentView(item.id as any); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl font-bold transition-all ${
                currentView === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6">
           <button 
            onClick={() => setIsLoggedIn(false)}
            className="w-full flex items-center gap-4 px-4 py-4 text-red-400 font-bold hover:bg-red-500/10 rounded-xl transition-all"
           >
             <LogOut size={20} />
             Cerrar Sesión
           </button>
        </div>
      </aside>

      {/* Mobile Nav Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b flex items-center justify-between px-6 z-50">
        <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2">
          <Menu size={24} className="text-slate-700" />
        </button>
        <h1 className="text-xl font-black text-slate-900 tracking-tighter">Sof-IA</h1>
        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">JO</div>
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}>
           <div className="w-80 h-full bg-slate-900 p-6 flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-10">
                 <h1 className="text-2xl font-black text-white tracking-tighter">Menu</h1>
                 <button onClick={() => setSidebarOpen(false)}><X className="text-white" /></button>
              </div>
              <nav className="flex-1 space-y-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setCurrentView(item.id as any); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl font-bold transition-all ${
                      currentView === item.id ? 'bg-blue-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </button>
                ))}
              </nav>
           </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:pt-0 pt-16 h-screen overflow-hidden">
        
        {/* Search / Global Header */}
        <header className="h-20 bg-white border-b border-slate-200 hidden lg:flex items-center justify-between px-10">
           <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-xl w-96">
              <Search size={18} className="text-slate-400" />
              <input type="text" placeholder="Buscar pacientes o reportes..." className="bg-transparent text-sm font-medium outline-none w-full" 
                onKeyDown={(e) => e.key === 'Enter' && alert(`Buscando: ${e.currentTarget.value}\nEstado: Indexando registros clínicos...`)} />
           </div>
           <div className="flex items-center gap-6">
              <div className="relative cursor-pointer" onClick={() => alert('Bandeja de Notificaciones\nEstado: 3 alertas críticas sin leer.')}>
                 <Bell size={22} className="text-slate-400" />
                 <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] flex items-center justify-center text-white font-black">3</span>
              </div>
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => alert('Perfil de Usuario: Dra. Johana\nUbicación: Onzaga, Santander\nEstado: Conectada')}>
                 <div className="text-right">
                    <p className="text-xs font-black text-slate-900 leading-none">Dra. Johana</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Onzaga, Santander</p>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white shadow-sm ring-2 ring-blue-50">
                    <User size={20} className="text-blue-600" />
                 </div>
              </div>
           </div>
        </header>

        {/* Dynamic Views */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-10">
           
           {/* VIEW: HOME / OVERVIEW */}
           {currentView === 'home' && (
             <div className="max-w-6xl mx-auto space-y-8">
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Hola, Dra. Johana 👋</h2>
                    <p className="text-slate-500 font-medium">Hay 10 pacientes activos bajo monitoreo en tiempo real.</p>
                  </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100" onClick={() => alert('Función: Vincular Nuevo Paciente\nEstado: Apertura de escáner biométrico y formulario de registro SaMD.')}>
                    <Plus size={20} />
                    Vincular Nuevo Paciente
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:bg-slate-50 transition-all" onClick={() => setCurrentView('patients')}>
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4">
                       <AlertCircle size={24} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 leading-none">3</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Alertas Críticas</p>
                 </div>
                 <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:bg-slate-50 transition-all" onClick={() => setCurrentView('patients')}>
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                       <Users size={24} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 leading-none">10</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Telemonitoreos</p>
                 </div>
                 <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:bg-slate-50 transition-all" onClick={() => setCurrentView('audit')}>
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                       <ShieldCheck size={24} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 leading-none">100%</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Sidecar Uptime</p>
                 </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                       <h3 className="text-lg font-black text-slate-900 tracking-tight">Pacientes con Prioridad</h3>
                       <button onClick={() => setCurrentView('patients')} className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline">Ver todos <ChevronRight size={16}/></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patients.slice(0, 4).map(p => (
                  <div key={p.id} onClick={() => { setSelectedPatientId(p.id); setCurrentView('patients'); }} className="cursor-pointer">
                    <PatientCard patient={p} />
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-4 h-full">
               <NotificationTray notifications={MOCK_NOTIFICATIONS} />
            </div>
         </div>
       </div>
     )}

     {/* VIEW: PATIENTS LIST / DETAIL */}
     {currentView === 'patients' && (
       <div className="max-w-6xl mx-auto h-full flex flex-col">
         <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Gestión de Pacientes</h2>
            <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200">
               <button className="px-4 py-2 text-xs font-bold bg-slate-100 rounded-lg">ACTIVOS</button>
               <button className="px-4 py-2 text-xs font-bold text-slate-400">HISTORIAL</button>
            </div>
         </div>
         
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full pb-20">
            <div className="lg:col-span-4 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
               {patients.map(p => (
                 <div key={p.id} onClick={() => setSelectedPatientId(p.id)}>
                   <PatientCard patient={p} isSelected={selectedPatientId === p.id} />
                 </div>
               ))}
            </div>
                  <div className="lg:col-span-8 h-full overflow-y-auto">
                     {selectedPatient ? (
                       <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm h-full">
                          <div className="flex justify-between items-start mb-10">
                             <div className="flex gap-6 items-center">
                                <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600 font-black text-2xl border-4 border-white shadow-md">
                                   {selectedPatient.name.charAt(0)}
                                </div>
                                <div>
                                   <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{selectedPatient.name}</h3>
                                   <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">{selectedPatient.location} • {selectedPatient.age} años</p>
                                </div>
                             </div>
                             <div className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border-2 ${
                               selectedPatient.status === 'critical' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                             }`}>
                                {selectedPatient.status}
                             </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                             <div className="bg-slate-950 text-white p-8 rounded-3xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-20"><Bell size={40}/></div>
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Métrica en Tiempo Real</p>
                                <div className="flex items-baseline gap-2">
                                   <span className="text-6xl font-black">{selectedPatient.glucose}</span>
                                   <span className="text-sm font-bold text-slate-500 uppercase">mg/dL</span>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-400">
                                   <ChevronRight size={16} className="rotate-[-90deg]" /> 
                                   Tendencia Estable
                                </div>
                             </div>
                             <div className="bg-blue-600 text-white p-8 rounded-3xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-20"><ShieldCheck size={40}/></div>
                                <p className="text-[10px] font-black text-blue-100 uppercase tracking-[0.2em] mb-4">Bioseguridad Activa</p>
                                <div className="text-xl font-black mb-2">Limitador Sidecar</div>
                                <p className="text-xs font-medium text-blue-100 opacity-80 leading-relaxed">
                                   El sistema de triaje autónomo está validando los parámetros del gemelo digital contra las GPC de Colombia.
                                </p>
                             </div>
                          </div>

                          {/* Glucose History Chart */}
                          <div className="bg-white border border-slate-100 rounded-3xl p-6 mb-10 shadow-sm">
                             <div className="flex justify-between items-center mb-6">
                                <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest flex items-center gap-2">
                                   <AlertCircle size={16} className="text-blue-600" /> Curva de Glucosa (Tiempo Real)
                                </h4>
                                <div className="flex gap-2">
                                   <div className="flex items-center gap-1">
                                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                      <span className="text-[10px] font-bold text-slate-400">mg/dL</span>
                                   </div>
                                </div>
                             </div>
                             <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                   <AreaChart data={history[selectedPatient.id] || []}>
                                      <defs>
                                         <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                         </linearGradient>
                                      </defs>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                      <XAxis 
                                         dataKey="time" 
                                         hide={true}
                                      />
                                      <YAxis 
                                         domain={['auto', 'auto']} 
                                         axisLine={false}
                                         tickLine={false}
                                         tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                                      />
                                      <Tooltip 
                                         contentStyle={{ 
                                            borderRadius: '16px', 
                                            border: 'none', 
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                            fontSize: '12px',
                                            fontWeight: 'bold'
                                         }}
                                      />
                                      <Area 
                                         type="monotone" 
                                         dataKey="glucose" 
                                         stroke="#2563eb" 
                                         strokeWidth={4}
                                         fillOpacity={1} 
                                         fill="url(#colorGlucose)" 
                                         animationDuration={300}
                                      />
                                   </AreaChart>
                                </ResponsiveContainer>
                             </div>
                          </div>

                          <div className="space-y-4">
                             <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest flex items-center gap-2">
                                <Plus size={16} className="text-blue-600" /> Acciones Rápidas
                             </h4>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {['Ver Historial', 'Reportar Nota', 'Pedir Examen', 'Ajustar Bolo'].map(act => (
                                  <button key={act} 
                                    onClick={() => alert(`Acción: ${act}\nPaciente: ${selectedPatient.name}\nEstado: Procesando requerimiento clínico...`)}
                                    className="p-4 bg-slate-100 rounded-2xl font-bold text-xs text-slate-700 hover:bg-blue-600 hover:text-white transition-all">
                                     {act}
                                  </button>
                                ))}
                             </div>
                          </div>
                       </div>
                     ) : (
                       <div className="h-full flex flex-col items-center justify-center text-slate-300 border-4 border-dashed border-slate-100 rounded-3xl p-10 text-center">
                          <Users size={64} className="mb-4 opacity-20" />
                          <p className="font-bold text-slate-400">Selecciona un paciente para ver su ficha clínica</p>
                       </div>
                     )}
                  </div>
               </div>
             </div>
           )}

           {/* VIEW: AUDIT SIMULATION */}
           {currentView === 'audit' && (
             <div className="max-w-4xl mx-auto space-y-10">
               <div className="text-center mb-10">
                 <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Auditoría de IA (SaMD)</h2>
                 <p className="text-slate-500 font-medium max-w-xl mx-auto mt-2">
                    Visualiza y pone a prueba el mecanismo de seguridad "Sidecar" que previene errores del modelo de lenguaje.
                 </p>
               </div>

               <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-10">
                 
                 {/* Input Simulation Controls */}
                 <div className="p-8 bg-blue-50 rounded-3xl border border-blue-100">
                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                       <Menu size={18} /> PANEL DE SIMULACIÓN DE RIESGO
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="space-y-6">
                          <div>
                            <div className="flex justify-between items-center mb-4">
                               <label className="text-xs font-black text-slate-700 uppercase">Sugerencia LLM (Insulina)</label>
                               <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-black">{llmDose} unidades</span>
                            </div>
                            <input 
                              type="range" min="0" max="50" step="1" 
                              value={llmDose}
                              onChange={(e) => setLlmDose(parseInt(e.target.value))}
                              className="w-full h-3 bg-blue-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-4">
                               <label className="text-xs font-black text-slate-700 uppercase">Insulina Activa (Stacking)</label>
                               <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-black">{lastDoseHours}h atrás</span>
                            </div>
                            <input 
                              type="range" min="0" max="5" step="0.5" 
                              value={lastDoseHours}
                              onChange={(e) => setLastDoseHours(parseFloat(e.target.value))}
                              className="w-full h-3 bg-blue-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                            />
                          </div>
                       </div>

                       <div className="bg-white p-6 rounded-2xl border border-blue-100 flex flex-col justify-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Paciente de Prueba</p>
                          <select 
                            className="w-full p-4 bg-slate-100 rounded-xl font-bold outline-none"
                            onChange={(e) => setSelectedPatientId(e.target.value)}
                            value={selectedPatientId || '2'}
                          >
                             {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.glucose} mg/dL)</option>)}
                          </select>
                       </div>
                    </div>
                 </div>

                 {/* Real Audit Output */}
                 <div className="pt-6">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                       <ShieldCheck size={20} className="text-emerald-500" /> RESULTADO DE VALIDACIÓN SIDECAR
                    </h3>
                    {(() => {
                       const audit = validateRecommendation(selectedPatient?.glucose || 100, llmDose, lastDoseHours);
                       const mockAuditFull = {
                          id: 'sim', patientId: '0', timestamp: 'AHORA',
                          llmRecommendation: llmDose > 0 ? `Sugerir dosis correctiva de ${llmDose} unidades.` : "Sin acción requerida.",
                          guardrailStatus: audit.status,
                          guardrailReason: audit.reason,
                          clinicalGuideline: `REGLA SOF-IA: ${audit.ruleApplied || 'ESTÁNDAR'}`,
                          intervention: audit.intervention
                       };
                       return <SidecarAudit audit={mockAuditFull as any} />;
                    })()}
                 </div>
               </div>
             </div>
           )}

           {/* VIEW: SETTINGS */}
           {currentView === 'settings' && (
             <div className="max-w-4xl mx-auto space-y-8 pb-20">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Parámetros de Seguridad</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="bg-white rounded-3xl p-8 border border-slate-200 space-y-6">
                      <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Umbrales Deterministas</h4>
                      {[
                        { label: 'Dosis Máxima Permitida', value: '10 unidades', desc: 'Previene sobredosis accidentales del LLM.' },
                        { label: 'Límite Hipoglucemia', value: '70 mg/dL', desc: 'Punto de bloqueo total de insulina.' },
                        { label: 'Margen de Stacking', value: '3 horas', desc: 'Protección contra el apilamiento de dosis.' },
                        { label: 'Alerta Crisis Hiper', value: '250 mg/dL', desc: 'Gatillo para escalamiento hospitalario.' },
                      ].map(s => (
                        <div key={s.label} className="flex flex-col gap-1">
                           <div className="flex justify-between items-center">
                              <span className="text-sm font-bold text-slate-700">{s.label}</span>
                              <span className="text-sm font-black text-blue-600">{s.value}</span>
                           </div>
                           <p className="text-[10px] text-slate-400 font-medium">{s.desc}</p>
                        </div>
                      ))}
                   </div>

                   <div className="bg-slate-900 text-white rounded-3xl p-8 space-y-6 relative overflow-hidden shadow-xl shadow-slate-200">
                      <div className="absolute -right-10 -bottom-10 opacity-10"><ShieldCheck size={200}/></div>
                      <h4 className="font-black text-blue-400 uppercase text-xs tracking-widest relative z-10">Estado del SaMD</h4>
                      <div className="space-y-4 relative z-10">
                         <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                            <p className="text-sm font-bold">Motor sidecar v2.4 Activo</p>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                            <p className="text-sm font-bold">Base GPC-COL-2023 Sincronizada</p>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                            <p className="text-sm font-bold">Protocolo Rural Edges Activo</p>
                         </div>
                      </div>
                      <button 
                        onClick={() => alert('Certificación de Logs de Seguridad\nEstado: Generando reporte firmado digitalmente...\nUbicación: Santander, COL')}
                        className="w-full mt-10 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all">
                        Certificar Logs de Seguridad
                      </button>
                   </div>
                </div>
             </div>
           )}

        </div>
      </main>

      {/* Navigation - Mobile Bottom Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-200 flex items-center justify-around px-2 z-50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as any)}
            className={`flex flex-col items-center gap-1 p-2 transition-all ${
              currentView === item.id ? 'text-blue-600' : 'text-slate-400'
            }`}
          >
            <item.icon size={24} strokeWidth={currentView === item.id ? 3 : 2} />
            <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
