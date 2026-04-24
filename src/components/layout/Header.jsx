import React from 'react';
import { Eye, GraduationCap, Shield, Bell, LogOut, Settings, LayoutDashboard, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';

function EyeLogo({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="eye-logo flex-shrink-0"
    >
      <defs>
        <radialGradient id="eyeGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#a78bfa" />
        </radialGradient>
        <filter id="eyeGlow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Outer eye shape */}
      <path
        d="M4 24 C12 10 36 10 44 24 C36 38 12 38 4 24Z"
        stroke="url(#eyeGrad)"
        strokeWidth="2"
        fill="none"
        filter="url(#eyeGlow)"
      />
      {/* Iris */}
      <circle cx="24" cy="24" r="8" fill="url(#eyeGrad)" opacity="0.9" />
      {/* Pupil */}
      <circle cx="24" cy="24" r="4" fill="#0f172a" />
      {/* Pupil highlight */}
      <circle cx="26" cy="22" r="1.5" fill="white" opacity="0.8" />
      {/* Eyelashes top */}
      <line x1="16" y1="11" x2="16" y2="8" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="24" y1="9" x2="24" y2="6" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="32" y1="11" x2="32" y2="8" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

export default function Header() {
  const { state, actions } = useApp();
  const { currentUser, currentView, selectedCourse } = state;

  const criticalCount = state.students.filter(s => s.riesgo === 'CRITICO').length;

  const getBreadcrumb = () => {
    if (currentView === 'dashboard') return null;
    if (currentView === 'admin') return [{ label: 'Dashboard', action: actions.goDashboard }, { label: 'Panel Administrativo' }];
    if (currentView === 'section' && selectedCourse) return [
      { label: 'Dashboard', action: actions.goDashboard },
      { label: selectedCourse.nombre }
    ];
    return null;
  };

  const breadcrumb = getBreadcrumb();

  return (
    <header className="sticky top-0 z-40 glass-card border-b border-slate-700/50 shadow-2xl">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo + Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={actions.goDashboard}
              className="flex items-center gap-3 group"
            >
              <EyeLogo size={38} />
              <div className="leading-tight">
                <span className="text-2xl font-black gradient-text tracking-tight">VIGÍA</span>
                <p className="text-xs text-slate-400 font-medium hidden sm:block">
                  Sistema de Alerta Temprana
                </p>
              </div>
            </button>

            {/* Breadcrumb */}
            {breadcrumb && (
              <div className="hidden md:flex items-center gap-1.5 ml-4 text-sm text-slate-400">
                <span className="text-slate-600 mx-1">|</span>
                {breadcrumb.map((crumb, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <ChevronRight size={14} className="text-slate-600" />}
                    {crumb.action ? (
                      <button
                        onClick={crumb.action}
                        className="hover:text-blue-400 transition-colors"
                      >
                        {crumb.label}
                      </button>
                    ) : (
                      <span className="text-slate-300 font-medium truncate max-w-48">
                        {crumb.label}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* Right side */}
          {currentUser && (
            <div className="flex items-center gap-2">
              {/* Alert bell */}
              <button 
                onClick={actions.toggleNotifications}
                className="relative p-2 rounded-lg hover:bg-slate-700/60 transition-colors text-slate-400 hover:text-slate-200"
              >
                <Bell size={18} />
                {criticalCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold leading-none">
                    {criticalCount}
                  </span>
                )}
              </button>

              {/* Admin Panel */}
              <button
                onClick={actions.goAdmin}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${currentView === 'admin'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                    : 'text-slate-400 hover:bg-slate-700/60 hover:text-slate-200'
                  }`}
              >
                <Settings size={15} />
                <span>Admin</span>
              </button>

              {/* Dashboard */}
              <button
                onClick={actions.goDashboard}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${currentView === 'dashboard'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                    : 'text-slate-400 hover:bg-slate-700/60 hover:text-slate-200'
                  }`}
              >
                <LayoutDashboard size={15} />
                <span>Dashboard</span>
              </button>

              {/* User avatar */}
              <div className="flex items-center gap-2 ml-1 pl-3 border-l border-slate-700/60">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {currentUser.nombre?.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs font-semibold text-slate-200 leading-tight">
                    {currentUser.nombre?.split(' ').slice(0, 2).join(' ')}
                  </p>
                  <p className="text-xs text-slate-500">{currentUser.codigo}</p>
                </div>
                <button
                  onClick={actions.logout}
                  title="Cerrar sesión"
                  className="ml-1 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security bar */}
      <div className="h-0.5 bg-gradient-to-r from-blue-900 via-blue-500 to-violet-600" />
    </header>
  );
}
