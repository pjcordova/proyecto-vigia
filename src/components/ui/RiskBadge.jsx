import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react';

const CONFIG = {
  CRITICO: {
    label: 'Riesgo Crítico',
    short: 'Crítico',
    bg: 'bg-red-500/20',
    border: 'border-red-500/50',
    text: 'text-red-400',
    dot: 'bg-red-500',
    icon: AlertTriangle,
    glow: 'risk-critical',
  },
  ALTO: {
    label: 'Riesgo Alto',
    short: 'Alto',
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/50',
    text: 'text-amber-400',
    dot: 'bg-amber-500',
    icon: AlertCircle,
    glow: 'risk-high',
  },
  MEDIO: {
    label: 'Riesgo Medio',
    short: 'Medio',
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/40',
    text: 'text-yellow-400',
    dot: 'bg-yellow-500',
    icon: Info,
    glow: '',
  },
  BAJO: {
    label: 'Sin Riesgo',
    short: 'Bajo',
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/40',
    text: 'text-emerald-400',
    dot: 'bg-emerald-500',
    icon: CheckCircle,
    glow: '',
  },
};

export default function RiskBadge({ level, size = 'sm', showIcon = false, pulse = false }) {
  const cfg = CONFIG[level] || CONFIG.BAJO;
  const Icon = cfg.icon;

  const sizes = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium
        ${cfg.bg} ${cfg.border} ${cfg.text} ${sizes[size]} ${cfg.glow}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${cfg.dot}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dot}`} />
        </span>
      )}
      {!pulse && showIcon && <Icon size={12} />}
      {!pulse && !showIcon && <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />}
      {size === 'xs' ? cfg.short : cfg.label}
    </span>
  );
}

export { CONFIG as RISK_CONFIG };
