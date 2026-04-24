import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Shield, Lock, AlertTriangle, Mail, ArrowRight, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

// Animated background particles
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-10"
          style={{
            width: `${Math.random() * 4 + 1}px`,
            height: `${Math.random() * 4 + 1}px`,
            background: i % 2 === 0 ? '#60a5fa' : '#a78bfa',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `pulse-slow ${2 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}
      {/* Grid lines */}
      <div className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(96,165,250,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(96,165,250,0.03) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
}

// Eye Logo for login
function EyeLogoBig() {
  return (
    <svg width="64" height="64" viewBox="0 0 48 48" fill="none" className="eye-logo mx-auto">
      <defs>
        <radialGradient id="eyeGrad2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#a78bfa" />
        </radialGradient>
      </defs>
      <path d="M4 24 C12 10 36 10 44 24 C36 38 12 38 4 24Z" stroke="url(#eyeGrad2)" strokeWidth="2" fill="rgba(96,165,250,0.05)" />
      <circle cx="24" cy="24" r="8" fill="url(#eyeGrad2)" opacity="0.9" />
      <circle cx="24" cy="24" r="4" fill="#0f172a" />
      <circle cx="26" cy="22" r="1.5" fill="white" opacity="0.8" />
    </svg>
  );
}

// ── Login Form ────────────────────────────────────────────────
function LoginForm() {
  const { state, actions } = useApp();
  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [codeError, setCodeError] = useState('');

  const remainingAttempts = 3 - state.loginAttempts;

  const validateCode = (val) => {
    if (!val) { setCodeError(''); return; }
    if (!/^C/.test(val)) setCodeError('Solo identificadores con prefijo "C" son permitidos.');
    else if (!/^C\d{1,5}$/.test(val)) setCodeError('Formato: C seguido de 5 dígitos (ej. C13005)');
    else setCodeError('');
  };

  const handleCodeChange = (e) => {
    const val = e.target.value.toUpperCase();
    setCodigo(val);
    validateCode(val);
    if (state.loginError) actions.clearLoginError();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!codigo || !password || codeError) return;
    actions.login(codigo, password);
  };

  if (state.accountLocked) {
    return (
      <div className="text-center space-y-5 animate-fade-in">
        <div className="mx-auto w-16 h-16 bg-red-500/20 border border-red-500/40 rounded-full flex items-center justify-center">
          <Lock size={28} className="text-red-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-red-400">Cuenta Bloqueada</h3>
          <p className="text-sm text-slate-400 mt-1">
            Se superó el límite de {3} intentos fallidos de inicio de sesión.
          </p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-300">
          <p className="font-medium mb-1">⚠ Política de Seguridad UTP</p>
          <p>Por protección, el acceso ha sido restringido temporalmente. Utilice el flujo de recuperación para restablecer el acceso.</p>
        </div>
        <button
          onClick={actions.initiateRecovery}
          className="btn-shine w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
        >
          <Mail size={16} />
          Recuperar acceso por correo institucional
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
      {/* Security notice */}
      <div className="flex items-start gap-2.5 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <Shield size={15} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-300">
          Acceso restringido a personal docente UTP. Solo identificadores con prefijo <strong>"C"</strong> son autorizados.
        </p>
      </div>

      {/* Error */}
      {state.loginError && (
        <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 rounded-lg p-3 animate-fade-in">
          <XCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-300">{state.loginError}</p>
        </div>
      )}

      {/* Código */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Código Docente
        </label>
        <div className="relative">
          <input
            type="text"
            value={codigo}
            onChange={handleCodeChange}
            placeholder="C13005"
            maxLength={6}
            className={`input-glow w-full bg-slate-800/80 border rounded-xl px-4 py-3 text-white placeholder-slate-500
              font-mono text-sm tracking-wider outline-none transition-all
              ${codeError ? 'border-red-500/60 focus:border-red-500' : 'border-slate-600/60 focus:border-blue-500/80'}`}
          />
          {codigo && !codeError && /^C\d{5}$/.test(codigo) && (
            <CheckCircle2 size={16} className="absolute right-3 top-3.5 text-emerald-400" />
          )}
          {codeError && (
            <XCircle size={16} className="absolute right-3 top-3.5 text-red-400" />
          )}
        </div>
        {codeError && <p className="text-xs text-red-400">{codeError}</p>}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Contraseña
        </label>
        <div className="relative">
          <input
            type={showPass ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="input-glow w-full bg-slate-800/80 border border-slate-600/60 focus:border-blue-500/80 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-500 text-sm outline-none transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Attempts warning */}
      {state.loginAttempts > 0 && remainingAttempts > 0 && (
        <div className="flex items-center gap-2 text-xs text-amber-400">
          <AlertTriangle size={13} />
          <span>Intentos restantes: <strong>{remainingAttempts}</strong> de 3</span>
          <div className="flex gap-1 ml-auto">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`h-1.5 w-5 rounded-full ${i < (3 - remainingAttempts) ? 'bg-red-500' : 'bg-slate-600'}`} />
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!codigo || !password || !!codeError}
        className="btn-shine w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600
          disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all
          flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40"
      >
        <Shield size={16} />
        Acceder al Sistema VIGÍA
        <ArrowRight size={16} />
      </button>

      {/* Demo credentials hint */}
      <div className="text-center">
        <p className="text-xs text-slate-600">
          Demo: <span className="text-slate-500 font-mono">C13005</span> / <span className="text-slate-500 font-mono">Utp2026#</span>
        </p>
      </div>
    </form>
  );
}

// ── Recovery Form ─────────────────────────────────────────────
function RecoveryForm() {
  const { state, actions } = useApp();
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(state.recoveryCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center">
        <div className="mx-auto w-14 h-14 bg-blue-500/20 border border-blue-500/40 rounded-full flex items-center justify-center mb-3">
          <Mail size={24} className="text-blue-400" />
        </div>
        <h3 className="font-bold text-white">Verificación de Identidad</h3>
        <p className="text-sm text-slate-400 mt-1">
          Se simuló el envío de un código de 6 dígitos a:
        </p>
        <p className="text-sm font-semibold text-blue-400 mt-0.5">{state.recoveryEmail}</p>
      </div>

      {/* Simulated code display */}
      <div className="bg-slate-800/60 border border-slate-600/40 rounded-xl p-4">
        <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-medium">
          📧 Correo Simulado — Código de Verificación
        </p>
        <div className="flex items-center justify-between">
          <span className="font-mono text-2xl font-bold text-blue-400 tracking-widest">
            {state.recoveryCode}
          </span>
          <button
            onClick={handleCopyCode}
            className="text-xs px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors"
          >
            {copied ? '✓ Copiado' : 'Copiar'}
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-2">Válido por 10 minutos · UTP Sistema Académico</p>
      </div>

      {/* Code input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Ingresar código de verificación
        </label>
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="• • • • • •"
          maxLength={6}
          className="input-glow w-full bg-slate-800/80 border border-slate-600/60 focus:border-blue-500/80 rounded-xl px-4 py-3 text-white placeholder-slate-500 font-mono text-xl tracking-widest text-center outline-none transition-all"
        />
        {state.recoveryError && (
          <p className="text-xs text-red-400">{state.recoveryError}</p>
        )}
      </div>

      <button
        onClick={() => actions.verifyRecovery(code)}
        disabled={code.length !== 6}
        className="btn-shine w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500
          disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all
          flex items-center justify-center gap-2"
      >
        <CheckCircle2 size={16} />
        Verificar y Restaurar Acceso
      </button>
    </div>
  );
}

// ── Main Login Page ───────────────────────────────────────────
export default function LoginPage() {
  const { state } = useApp();
  const isRecovery = state.authState === 'recovery';

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-slate-950 p-4">
      <Particles />

      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Card */}
        <div className="glass-card rounded-2xl p-8 shadow-2xl border border-slate-700/50">

          {/* Header */}
          <div className="text-center mb-8">
            <EyeLogoBig />
            <h1 className="text-3xl font-black gradient-text mt-3 tracking-tight">VIGÍA</h1>
            <p className="text-slate-400 text-sm mt-1 font-medium">Sistema de Alerta Temprana Académica</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-slate-700" />
              <span className="text-xs text-slate-600 font-medium uppercase tracking-widest">UTP · 2026-I</span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-slate-700" />
            </div>
          </div>

          {/* Form */}
          {isRecovery ? <RecoveryForm /> : <LoginForm />}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Universidad Tecnológica del Perú · Dirección de Tecnología Educativa
        </p>
      </div>
    </div>
  );
}
