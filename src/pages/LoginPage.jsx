import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Shield, Lock, AlertTriangle, Mail, ArrowRight, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../hooks/useAuth.js';

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
  const { actions } = useApp();
  const { signIn, loading, error: authError } = useAuth();
  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [codeError, setCodeError] = useState('');

  const validateCode = (val) => {
    if (!val) { setCodeError(''); return; }
    if (val.includes('@')) {
      if (!val.endsWith('@utp.edu.pe')) {
        setCodeError('El correo institucional debe terminar en @utp.edu.pe');
      } else {
        setCodeError('');
      }
    } else {
      if (!/^C/.test(val)) setCodeError('Solo identificadores con prefijo "C" o correos @utp.edu.pe son autorizados.');
      else if (!/^C\d{1,5}$/.test(val)) setCodeError('Formato: C seguido de 5 dígitos (ej. C13005)');
      else setCodeError('');
    }
  };

  const handleCodeChange = (e) => {
    const val = e.target.value;
    // Auto capitalize if it doesn't contain an email '@' to preserve code UX
    const processedVal = val.includes('@') ? val : val.toUpperCase();
    setCodigo(processedVal);
    validateCode(processedVal);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!codigo || !password || codeError || loading) return;

    try {
      const { user, profile } = await signIn(codigo, password);
      actions.loginSuccess(user, profile);
    } catch (err) {
      console.error('Error de inicio de sesión:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
      {/* Security notice */}
      <div className="flex items-start gap-2.5 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <Shield size={15} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-300">
          Acceso restringido a personal docente UTP. Use su código docente con prefijo <strong>"C"</strong> o su correo institucional.
        </p>
      </div>

      {/* Error */}
      {authError && (
        <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 rounded-lg p-3 animate-fade-in">
          <XCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-300">{authError}</p>
        </div>
      )}

      {/* Código */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Código Docente o Correo
        </label>
        <div className="relative">
          <input
            type="text"
            value={codigo}
            onChange={handleCodeChange}
            placeholder="C13005"
            disabled={loading}
            className={`input-glow w-full bg-slate-800/80 border rounded-xl px-4 py-3 text-white placeholder-slate-500
              font-mono text-sm tracking-wider outline-none transition-all
              ${codeError ? 'border-red-500/60 focus:border-red-500' : 'border-slate-600/60 focus:border-blue-500/80'}`}
          />
          {codigo && !codeError && (codigo.includes('@') ? codigo.endsWith('@utp.edu.pe') : /^C\d{5}$/.test(codigo)) && (
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
            disabled={loading}
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

      {/* Submit */}
      <button
        type="submit"
        disabled={!codigo || !password || !!codeError || loading}
        className="btn-shine w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600
          disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all
          flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40"
      >
        {loading ? (
          <RefreshCw size={16} className="animate-spin" />
        ) : (
          <Shield size={16} />
        )}
        {loading ? 'Autenticando...' : 'Acceder al Sistema VIGÍA'}
        {!loading && <ArrowRight size={16} />}
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
