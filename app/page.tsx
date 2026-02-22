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
  Plus,
  AlertCircle,
  Volume2,
  VolumeX,
  LogOut,
  CheckCircle2,
  Activity
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

  // Functional States
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loginError, setLoginError] = useState('');

  // Login State
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Simulation for Audit logic
  const [llmDose, setLlmDose] = useState(2);
  const [lastDoseHours, setLastDoseHours] = useState(1.5);

  // Config States
  const [audioMuted, setAudioMuted] = useState(false);
  const [thresholds, setThresholds] = useState({
    hypoThreshold: 70,
    hyperThreshold: 250,
    maxInsulinDose: 10,
    stackingHours: 3
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.includes(searchQuery)
  );

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  // LocalStorage Persistence - Initial Load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPatients = localStorage.getItem('sofia_patients');
      if (savedPatients && JSON.parse(savedPatients).length > 0) setPatients(JSON.parse(savedPatients));

      const savedHistory = localStorage.getItem('sofia_history');
      if (savedHistory) setHistory(JSON.parse(savedHistory));

      const savedThresholds = localStorage.getItem('sofia_thresholds');
      if (savedThresholds) setThresholds(JSON.parse(savedThresholds));

      const savedLogin = localStorage.getItem('sofia_login');
      if (savedLogin === 'true') setIsLoggedIn(true);

      const savedMute = localStorage.getItem('sofia_audio_muted');
      if (savedMute) setAudioMuted(savedMute === 'true');
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('sofia_patients', JSON.stringify(patients));
      localStorage.setItem('sofia_history', JSON.stringify(history));
    }
  }, [patients, history, isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('sofia_thresholds', JSON.stringify(thresholds));
    localStorage.setItem('sofia_audio_muted', String(audioMuted));
  }, [thresholds, audioMuted]);

  // Audio Alert Effect
  useEffect(() => {
    if (audioMuted || !isLoggedIn) return;
    const hasCritical = patients.some(p => p.status === 'critical');
    if (hasCritical) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.value = 800; // High pitch alert
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.1); // short beep
      } catch (e) { /* ignore auto-play policies until user interacts */ }
    }
  }, [patients, audioMuted, isLoggedIn]);

  // Glucose Simulation Effect
  useEffect(() => {
    if (!isLoggedIn) return;

    // Initialize history for existing patients so charts are full instantly
    setHistory(prev => {
      const newHistory = { ...prev };
      let changed = false;
      const now = new Date();
      patients.forEach((patient: typeof patients[0]) => {
        if (!newHistory[patient.id]) {
          changed = true;
          const patientHistory = [];
          let curveG = patient.glucose;
          for (let i = 19; i >= 0; i--) {
            curveG = Math.max(40, Math.min(450, curveG - (Math.floor(Math.random() * 7) - 3)));
            const t = new Date(now.getTime() - i * 5000);
            const tStr = `${t.getHours()}:${t.getMinutes().toString().padStart(2, '0')}:${t.getSeconds().toString().padStart(2, '0')}`;
            patientHistory.push({ time: tStr, glucose: curveG });
          }
          newHistory[patient.id] = patientHistory;
        }
      });
      return changed ? newHistory : prev;
    });

    const intervalId = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      // Create deterministic updates for this tick outside the setters
      setPatients(prevPatients => {
        const nextPatients = prevPatients.map(patient => {
          let change = Math.floor(Math.random() * 7) - 3;
          if (patient.trend === 'up') change += 1;
          if (patient.trend === 'down') change -= 1;

          let newGlucose = patient.glucose + change;
          if (newGlucose < 40) newGlucose = 40;
          if (newGlucose > 450) newGlucose = 450;

          let newStatus = patient.status;
          if (newGlucose < thresholds.hypoThreshold || newGlucose > thresholds.hyperThreshold) {
            newStatus = 'critical';
          } else if (newGlucose < thresholds.hypoThreshold + 20 || newGlucose > thresholds.hyperThreshold - 70) {
            newStatus = 'warning';
          } else {
            newStatus = 'stable';
          }

          let newTrend = patient.trend;
          if (Math.random() > 0.9) {
            const trends: ('up' | 'down' | 'stable')[] = ['up', 'down', 'stable'];
            newTrend = trends[Math.floor(Math.random() * trends.length)];
          }

          return { ...patient, glucose: newGlucose, status: newStatus, trend: newTrend, lastUpdate: 'Ahora' };
        });

        // Safe history update outside the patient mapping but inside the tick context
        // We use a timeout to place it in the next macro-task to avoid React strictly complaining about nested renders.
        setTimeout(() => {
          setHistory(prevHistory => {
            const nextHistory = { ...prevHistory };
            nextPatients.forEach(p => {
              const h = nextHistory[p.id] || [];
              nextHistory[p.id] = [...h, { time: timeStr, glucose: p.glucose }].slice(-30); // 30 points for a denser chart
            });
            return nextHistory;
          });
        }, 0);

        return nextPatients;
      });
    }, 2000); // Accelerated strictly to 2 seconds for high visibility

    return () => clearInterval(intervalId);
  }, [isLoggedIn]); // Solo ejecutamos si isLoggedIn cambia

  // OpenClaw Bot API (Two-way binding for external Autonomous AI)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).OpenClawAPI = {
        ping: () => "Sof-IA Agent Bridge Active",
        getPatients: () => patients,
        getCriticalAlerts: () => patients.filter(p => p.status === 'critical'),
        administerIntervention: (patientId: string, type: 'insulin' | 'glucose', units: number) => {
          showToast(`⚠️ Acción Remota (OpenClaw): ${type === 'insulin' ? 'Insulina' : 'Glucosa'} administrada a ${patientId}`);
          setPatients(prev => prev.map(p => {
            if (p.id !== patientId) return p;
            const change = type === 'insulin' ? -(units * 3) : (units * 5); // Simple physiological mock
            return { ...p, glucose: Math.max(40, p.glucose + change) };
          }));
        },
        openAuditPanel: (patientId: string) => {
          setSelectedPatientId(patientId);
          setCurrentView('audit');
        }
      };
    }
  }, [patients]);

  // Authentication Guard (Simulated)
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 font-sans">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-800/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-md w-full relative z-10">
          <div className="bg-white rounded-[40px] p-8 sm:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/10">
            <div className="flex justify-center mb-8">
               <div className="bg-blue-600 p-5 rounded-3xl shadow-xl shadow-blue-500/20 animate-pulse">
                  <Activity className="text-white" size={48} />
               </div>
            </div>
            
            <div className="text-center mb-10">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Sof-IA V3.0</h1>
              <div className="flex items-center justify-center gap-2">
                <span className="h-[1px] w-8 bg-slate-200" />
                <p className="text-slate-500 text-[10px] uppercase font-black tracking-[0.3em]">Acceso Bio-Seguro</p>
                <span className="h-[1px] w-8 bg-slate-200" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="group">
                <label className="text-[11px] font-black text-black uppercase ml-1 block mb-2 transition-colors group-focus-within:text-blue-600">ID Facultativo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-black group-focus-within:text-blue-600" size={20} />
                  <input
                    type="text"
                    placeholder="Ingrese su registro"
                    className="w-full pl-12 pr-4 py-5 bg-white border-4 border-black rounded-2xl outline-none focus:ring-0 focus:border-[5px] focus:border-blue-600 transition-all font-black text-[22px] text-[#000000] block placeholder:text-[#555555]"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                  />
                </div>
              </div>

              <div className="group">
                <label className="text-[11px] font-black text-black uppercase ml-1 block mb-2 transition-colors group-focus-within:text-blue-600">Contraseña Maestra</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-black group-focus-within:text-blue-600" size={20} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-5 bg-white border-4 border-black rounded-2xl outline-none focus:ring-0 focus:border-[5px] focus:border-blue-600 transition-all font-black text-[22px] text-[#000000] block placeholder:text-[#555555]"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                  />
                </div>
              </div>

              {loginError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm font-bold animate-pulse">
                  {loginError}
                </div>
              )}

              <div className="pt-4 space-y-4">
                <button
                  onClick={() => {
                    if (loginId === 'DR-JOHANA-2026' && loginPass === 'password') {
                      setIsLoggedIn(true);
                      setLoginError('');
                    } else {
                      setLoginError('VERIFICACIÓN FALLIDA: Las credenciales no coinciden.');
                    }
                  }}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  AUTORIZAR ACCESO
                  <ChevronRight size={20} />
                </button>

                <div className="relative flex items-center justify-center py-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                  <span className="relative bg-white px-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">O</span>
                </div>

                <button
                  onClick={() => { setLoginId('DR-JOHANA-2026'); setLoginPass('password'); }}
                  className="w-full py-4 border-2 border-dashed border-slate-200 text-slate-400 font-black text-xs rounded-2xl uppercase hover:border-blue-300 hover:text-blue-500 transition-all active:bg-blue-50"
                >
                  Usar Credenciales de Emergencia
                </button>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
                Sistema Certificado SaMD Clase IIa <br />
                Onzaga Monitor v2.4 • Santander, COL
              </p>
            </div>
          </div>
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
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl font-bold transition-all ${currentView === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
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
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl font-bold transition-all ${currentView === item.id ? 'bg-blue-600 text-white' : 'text-slate-400'
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
            <input type="text" placeholder="Buscar pacientes o reportes..." className="bg-transparent text-slate-900 placeholder:text-slate-400 text-sm font-medium outline-none w-full"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex items-center gap-6 relative">
            <div
              className="relative cursor-pointer hover:bg-slate-100 p-2 rounded-full transition-colors flex items-center justify-center"
              onClick={() => setAudioMuted(!audioMuted)}
            >
              {audioMuted ? <VolumeX size={22} className="text-slate-400" /> : <Volume2 size={22} className="text-blue-500" />}
            </div>

            <div
              className="relative cursor-pointer hover:bg-slate-100 p-2 rounded-full transition-colors flex items-center justify-center"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
            >
              <Bell size={22} className="text-slate-400" />
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-[8px] flex items-center justify-center text-white font-black">3</span>
            </div>

            {showNotifications && (
              <div className="absolute top-14 right-48 w-80 h-[400px] z-50 shadow-2xl rounded-2xl border border-slate-200">
                <NotificationTray notifications={MOCK_NOTIFICATIONS} />
              </div>
            )}

            <div
              className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors relative"
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
            >
              <div className="text-right">
                <p className="text-xs font-black text-slate-900 leading-none">Dra. Johana</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Onzaga, Santander</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white shadow-sm ring-2 ring-blue-50 relative">
                <User size={20} className="text-blue-600" />
                {/* Status Indicator */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>

              {showProfile && (
                <div
                  className="absolute top-16 right-0 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-[60]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h4 className="font-black text-slate-900 border-b pb-2 mb-2">Perfil Clínico</h4>
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600"><b>ID:</b> DR-JOHANA-2026</p>
                    <p className="text-xs text-slate-600"><b>Ubicación:</b> CAP Onzaga</p>
                    <p className="text-xs text-slate-600 flex items-center gap-2"><span className="w-2 h-2 inline-block bg-emerald-500 rounded-full shadow-[0_0_5px_#10b981]"></span> Sesión Activa (SaMD)</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLoggedIn(false);
                      }}
                      className="w-full mt-2 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut size={14} /> Cerrar Sesión Local
                    </button>
                  </div>
                </div>
              )}
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
                  <p className="text-slate-500 font-medium">Hay {patients.length} pacientes activos bajo monitoreo en tiempo real.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100" onClick={() => setShowAddPatient(true)}>
                  <Plus size={20} />
                  Vincular Nuevo Paciente
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:bg-slate-50 transition-all" onClick={() => setCurrentView('patients')}>
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4">
                    <AlertCircle size={24} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 leading-none">{patients.filter(p => p.status === 'critical').length}</h3>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Alertas Críticas</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:bg-slate-50 transition-all" onClick={() => setCurrentView('patients')}>
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                    <Users size={24} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 leading-none">{patients.length}</h3>
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
                    <button onClick={() => setCurrentView('patients')} className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline">Ver todos <ChevronRight size={16} /></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...filteredPatients]
                      .sort((a, b) => {
                        if (a.status === 'critical' && b.status !== 'critical') return -1;
                        if (b.status === 'critical' && a.status !== 'critical') return 1;
                        if (a.status === 'warning' && b.status !== 'warning') return -1;
                        if (b.status === 'warning' && a.status !== 'warning') return 1;
                        return 0;
                      })
                      .slice(0, 4).map(p => (
                        <div key={p.id} onClick={() => { setSelectedPatientId(p.id); setCurrentView('patients'); }} className="cursor-pointer transition-transform hover:-translate-y-1">
                          <PatientCard patient={p} history={history[p.id]} />
                        </div>
                      ))}
                    {filteredPatients.length === 0 && (
                      <p className="col-span-2 text-center text-slate-400 font-bold py-10">Ningún paciente coincide con la búsqueda.</p>
                    )}
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
                  {filteredPatients.map(p => (
                    <div key={p.id} onClick={() => setSelectedPatientId(p.id)} className="cursor-pointer transition-transform hover:scale-[1.02]">
                      <PatientCard patient={p} isSelected={selectedPatientId === p.id} history={history[p.id]} />
                    </div>
                  ))}
                  {filteredPatients.length === 0 && (
                    <p className="text-center text-slate-400 font-bold py-10">Ningún paciente encontrado.</p>
                  )}
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
                        <div className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border-2 ${selectedPatient.status === 'critical' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                          }`}>
                          {selectedPatient.status}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <div className="bg-slate-950 text-white p-8 rounded-3xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-20"><Bell size={40} /></div>
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
                        <div
                          className="bg-blue-600 text-white p-8 rounded-3xl relative overflow-hidden cursor-pointer hover:bg-blue-700 transition-all hover:-translate-y-1 shadow-lg shadow-blue-500/30 group"
                          onClick={() => {
                            setCurrentView('audit');
                            showToast(`Abriendo el panel de auditoría SaMD`);
                          }}
                        >
                          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform"><ShieldCheck size={40} /></div>
                          <p className="text-[10px] font-black text-blue-100 uppercase tracking-[0.2em] mb-4">Bioseguridad Activa</p>
                          <div className="text-xl font-black mb-2 flex items-center gap-2">Limitador Sidecar <ChevronRight size={18} className="opacity-50" /></div>
                          <p className="text-xs font-medium text-blue-100 opacity-80 leading-relaxed">
                            El sistema de triaje autónomo está validando los parámetros del gemelo digital contra las GPC de Colombia. Haz clic para auditar.
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
                                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
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
                          <button
                            onClick={() => showToast(`Cargando historial completo de ${selectedPatient.name}...`)}
                            className="p-4 bg-slate-100 rounded-2xl font-bold text-xs text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-all active:scale-95 flex flex-col items-center justify-center gap-2"
                          >
                            <Menu size={18} className="text-slate-500" />
                            Ver Historial
                          </button>
                          <button
                            onClick={() => showToast(`Formulario de nota clínica abierto`)}
                            className="p-4 bg-slate-100 rounded-2xl font-bold text-xs text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-all active:scale-95 flex flex-col items-center justify-center gap-2"
                          >
                            <User size={18} className="text-slate-500" />
                            Reportar Nota
                          </button>
                          <button
                            onClick={() => showToast(`Solicitud de laboratorio enviada para ${selectedPatient.name}`)}
                            className="p-4 bg-slate-100 rounded-2xl font-bold text-xs text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-all active:scale-95 flex flex-col items-center justify-center gap-2"
                          >
                            <AlertCircle size={18} className="text-slate-500" />
                            Pedir Examen
                          </button>
                          <button
                            onClick={() => {
                              setCurrentView('audit');
                              showToast(`El asistente te guiará para calcular el bolo de forma segura.`);
                            }}
                            className="p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl font-bold text-xs text-blue-700 hover:bg-blue-600 hover:text-white transition-all active:scale-95 flex flex-col items-center justify-center gap-2 group"
                          >
                            <ShieldCheck size={18} className="text-blue-500 group-hover:text-white" />
                            Ajustar Bolo
                          </button>
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
                        className="w-full p-4 bg-white border-4 border-black rounded-xl outline-none focus:ring-0 focus:border-[5px] focus:border-blue-600 transition-all font-black text-lg text-[#000000] cursor-pointer"
                        onChange={(e) => setSelectedPatientId(e.target.value)}
                        value={selectedPatientId || '2'}
                      >
                        {patients.map(p => <option key={p.id} value={p.id} className="text-[#000000] font-black">{p.name} ({p.glucose} mg/dL)</option>)}
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
                    const audit = validateRecommendation(selectedPatient?.glucose || 100, llmDose, lastDoseHours, thresholds);
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
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Parámetros de Seguridad GPC</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl p-8 border border-slate-200 space-y-6">
                  <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Umbrales Deterministas</h4>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 uppercase flex justify-between">
                        Límite Hipoglucemia <span className="text-red-500 font-black">{thresholds.hypoThreshold} mg/dL</span>
                      </label>
                      <input type="range" min="40" max="90" value={thresholds.hypoThreshold} onChange={(e) => setThresholds({ ...thresholds, hypoThreshold: parseInt(e.target.value) })} className="w-full h-3 bg-red-100 rounded-full appearance-none cursor-pointer accent-red-500" />
                      <p className="text-[10px] text-slate-400 font-medium">Punto de bloqueo total de insulina por riesgo neurológico.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 uppercase flex justify-between">
                        Alerta Crítica Hiper <span className="text-red-500 font-black">{thresholds.hyperThreshold} mg/dL</span>
                      </label>
                      <input type="range" min="180" max="350" value={thresholds.hyperThreshold} onChange={(e) => setThresholds({ ...thresholds, hyperThreshold: parseInt(e.target.value) })} className="w-full h-3 bg-red-100 rounded-full appearance-none cursor-pointer accent-red-500" />
                      <p className="text-[10px] text-slate-400 font-medium">Gatillo para escalamiento hospitalario por riesgo CAD.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 uppercase flex justify-between">
                        Dosis Máxima de Insulina <span className="text-blue-500 font-black">{thresholds.maxInsulinDose} U</span>
                      </label>
                      <input type="range" min="5" max="25" value={thresholds.maxInsulinDose} onChange={(e) => setThresholds({ ...thresholds, maxInsulinDose: parseInt(e.target.value) })} className="w-full h-3 bg-blue-100 rounded-full appearance-none cursor-pointer accent-blue-500" />
                      <p className="text-[10px] text-slate-400 font-medium">Filtro anti-alucinaciones LLM para prevenir sobredosis letal.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 uppercase flex justify-between">
                        Vida Media Stacking <span className="text-blue-500 font-black">{thresholds.stackingHours} h</span>
                      </label>
                      <input type="range" min="1" max="6" step="0.5" value={thresholds.stackingHours} onChange={(e) => setThresholds({ ...thresholds, stackingHours: parseFloat(e.target.value) })} className="w-full h-3 bg-blue-100 rounded-full appearance-none cursor-pointer accent-blue-500" />
                      <p className="text-[10px] text-slate-400 font-medium">Protección farmacocinética contra apilamiento.</p>
                    </div>
                  </div>

                  <button onClick={() => showToast('Nuevos umbrales clínicos guardados exitosamente.')} className="w-full mt-4 bg-slate-900 text-white py-4 rounded-xl font-black shadow-lg shadow-slate-200">
                    Aplicar Nuevas Guías Médicas
                  </button>
                </div>

                <div className="bg-slate-900 text-white rounded-3xl p-8 space-y-6 relative overflow-hidden shadow-xl shadow-slate-200">
                  <div className="absolute -right-10 -bottom-10 opacity-10"><ShieldCheck size={200} /></div>
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
                    onClick={() => showToast('Certificación de Logs generada exitosamente. Firma digital aplicada.')}
                    className="w-full mt-10 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all active:scale-[0.98]">
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
            className={`flex flex-col items-center gap-1 p-2 transition-all ${currentView === item.id ? 'text-blue-600' : 'text-slate-400'
              }`}
          >
            <item.icon size={24} strokeWidth={currentView === item.id ? 3 : 2} />
            <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* REUSABLE MODALS & TOASTS */}
      {showAddPatient && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-slate-100 scale-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900">Vincular Paciente</h3>
              <button onClick={() => setShowAddPatient(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Nombre Completo</label>
                <input type="text" value={newPatientName} onChange={e => setNewPatientName(e.target.value)} placeholder="Ej. Carlos Mendoza" className="w-full p-4 bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
              </div>
              <button onClick={() => {
                if (!newPatientName) return;
                const newP: typeof patients[0] = {
                  id: `p${Date.now()}`,
                  name: newPatientName,
                  age: 45,
                  location: 'Zona Rural',
                  status: 'stable',
                  glucose: 100,
                  trend: 'stable',
                  tir: Math.floor(Math.random() * (95 - 65 + 1)) + 65,
                  lastUpdate: 'Ahora'
                };
                setPatients([newP, ...patients]);
                setShowAddPatient(false);
                setNewPatientName('');
                showToast('Paciente vinculado exitosamente');
              }} className="w-full py-4 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all">Confirmar Registro</button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-24 right-4 lg:bottom-10 lg:right-10 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl z-[100] font-bold text-sm flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <CheckCircle2 size={18} className="text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* OpenClaw Agent Data Bridge - Invisible to human users, accessible to standard DOM crawlers */}
      <div
        id="agent-data-bridge"
        className="hidden"
        data-state={JSON.stringify({
          activePatientsCount: patients.length,
          criticalAlerts: patients.filter(p => p.status === 'critical').length,
          telemetry: patients.map(p => ({
            id: p.id,
            n: p.name,
            g: p.glucose,
            t: p.trend,
            s: p.status
          }))
        })}
      />
    </div>
  );
}
