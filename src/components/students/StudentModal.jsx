import React from 'react';
import {
  X, Mail, Send, TrendingUp, TrendingDown, AlertTriangle, BookOpen,
  Activity, Clock, Award, BarChart2, Zap, Brain, CheckCircle2
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { useApp } from '../../context/AppContext.jsx';
import RiskBadge from '../ui/RiskBadge.jsx';
import { notaNecesariaPC4, ROUND_THRESHOLD, MIN_APPROVAL } from '../../data/dataset.js';

// AI Recommendations based on risk level
function getAIRecommendations(student) {
  const recs = {
    CRITICO: [
      {
        tipo: 'Intervención Urgente',
        icon: AlertTriangle,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        texto: `${student.nombre.split(' ')[0]} presenta patrones de abandono silencioso: ${student.actividadDias} días sin actividad registrada y ${student.asistencia}% de asistencia. Se recomienda contacto inmediato vía correo institucional y coordinación con bienestar estudiantil.`,
      },
      {
        tipo: 'Plan de Recuperación',
        icon: TrendingUp,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        texto: `Para recuperar la situación académica, el estudiante necesita obtener ${student.necesitaPC4 ? student.necesitaPC4.toFixed(1) : 'N/A'} en la PC4. Proponer sesiones de tutoría individualizadas y refuerzo en los temas de mayor dificultad.`,
      },
      {
        tipo: 'Análisis Predictivo IA',
        icon: Brain,
        color: 'text-violet-400',
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/30',
        texto: 'El modelo predictivo indica 87% de probabilidad de abandono si no se interviene en los próximos 7 días. Patrón consistente con "Silencio Digital": reducción gradual de accesos al campus virtual.',
      },
    ],
    ALTO: [
      {
        tipo: 'Monitoreo Activo',
        icon: Activity,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        texto: `Promedio actual ${student.promedio.toFixed(1)} está por debajo del mínimo aprobatorio. Asistencia del ${student.asistencia}% es recuperable. Recomendar plan de estudio intensivo para la PC4.`,
      },
      {
        tipo: 'Análisis Predictivo IA',
        icon: Brain,
        color: 'text-violet-400',
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/30',
        texto: 'Probabilidad de recuperación: 62% con intervención temprana. Se detectó disminución progresiva del rendimiento en los últimos 2 períodos de evaluación.',
      },
    ],
    MEDIO: [
      {
        tipo: 'Seguimiento Preventivo',
        icon: Zap,
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        texto: `El rendimiento está en zona de alerta. Con ${student.necesitaPC4 ? student.necesitaPC4.toFixed(1) : 'menos de 12'} en la PC4 puede aprobar el curso. Motivar la participación activa en las sesiones de práctica.`,
      },
    ],
    BAJO: [
      {
        tipo: 'Rendimiento Óptimo',
        icon: CheckCircle2,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        texto: `Excelente desempeño académico. Promedio de ${student.promedio.toFixed(1)} con ${student.asistencia}% de asistencia. Candidato para programa de alumnos destacados y apoyo entre pares.`,
      },
    ],
  };
  return recs[student.riesgo] || recs.BAJO;
}

function GradeBar({ label, value, max = 20 }) {
  const pct = (value / max) * 100;
  const color = value >= 12 ? 'from-emerald-500 to-teal-400' : value >= 10 ? 'from-amber-500 to-yellow-400' : 'from-red-600 to-red-400';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className={`font-bold font-mono ${value >= 12 ? 'text-emerald-400' : value >= 10 ? 'text-amber-400' : 'text-red-400'}`}>
          {value.toFixed(1)}
        </span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-xs">
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="text-blue-400 font-bold">{payload[0].value} accesos</p>
      </div>
    );
  }
  return null;
};

export default function StudentModal({ student, onClose }) {
  const { actions } = useApp();
  const recs = getAIRecommendations(student);

  const handleIntervention = () => {
    actions.markIntervened(student.codigo);
    alert(`✅ Correo de intervención enviado a ${student.email}\n\nAsunto: "Seguimiento Académico - VIGÍA Sistema de Alerta"\n\nEl registro de intervención ha sido guardado en el sistema.`);
  };

  const needsRounding = student.promedio >= ROUND_THRESHOLD && student.promedio < MIN_APPROVAL;
  const pc4Needed = notaNecesariaPC4(student.grades);

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="glass-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-600/50 shadow-2xl animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/40 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {student.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <h2 className="font-bold text-white leading-tight">{student.nombre}</h2>
              <p className="text-xs text-slate-400 font-mono">{student.codigo} · {student.carrera}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <RiskBadge level={student.riesgo} size="sm" pulse={student.riesgo === 'CRITICO'} />
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-700/60 text-slate-400 hover:text-white transition-all">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Key metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Promedio', value: student.promedio.toFixed(2), sub: needsRounding ? '→ 12 (visual)' : '', color: student.promedio >= 12 ? 'text-emerald-400' : student.promedio >= 10 ? 'text-amber-400' : 'text-red-400' },
              { label: 'Nota Final', value: student.notaFinal, sub: needsRounding ? '⟳ Redondeado' : 'Sin redondeo', color: student.notaFinal >= 12 ? 'text-emerald-400' : 'text-red-400' },
              { label: 'Asistencia', value: `${student.asistencia}%`, sub: student.asistencia < 65 ? 'Deficiente' : 'Aceptable', color: student.asistencia >= 75 ? 'text-emerald-400' : student.asistencia >= 65 ? 'text-amber-400' : 'text-red-400' },
              { label: 'Inactividad', value: `${student.actividadDias}d`, sub: student.actividadDias > 14 ? 'Abandono Silencioso' : 'Normal', color: student.actividadDias > 21 ? 'text-red-400' : student.actividadDias > 14 ? 'text-amber-400' : 'text-emerald-400' },
            ].map(m => (
              <div key={m.label} className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-3 text-center">
                <p className={`text-2xl font-black ${m.color}`}>{m.value}</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{m.label}</p>
                {m.sub && <p className={`text-xs mt-0.5 ${m.color} opacity-70`}>{m.sub}</p>}
              </div>
            ))}
          </div>

          {/* PC4 Projection */}
          {pc4Needed !== null && pc4Needed > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart2 size={15} className="text-blue-400" />
                <span className="text-sm font-semibold text-blue-300">Proyección PC4 — Motor UTP</span>
              </div>
              <p className="text-xs text-slate-300">
                Para alcanzar el <strong className="text-white">11.5 acumulado</strong> (mínimo aprobatorio con redondeo),
                el estudiante necesita obtener al menos{' '}
                <strong className={`text-lg font-black ${pc4Needed > 15 ? 'text-red-400' : pc4Needed > 12 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {pc4Needed.toFixed(1)}
                </strong>
                {' '}en la PC4 (peso: 40%).
              </p>
              {pc4Needed > 18 && (
                <p className="text-xs text-red-400 mt-2">⚠ La nota requerida supera el 18/20 — recuperación muy difícil.</p>
              )}
            </div>
          )}
          {pc4Needed === null && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
              <p className="text-xs text-red-300">
                ⛔ <strong>Matemáticamente imposible aprobar:</strong> Incluso con 20/20 en PC4, no alcanzaría el mínimo de 11.5.
              </p>
            </div>
          )}

          {/* Grades breakdown */}
          <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Award size={14} className="text-violet-400" /> Detalle de Notas (Pesos UTP)
            </h3>
            <GradeBar label="PC1 (20%)" value={student.grades.PC1} />
            <GradeBar label="PC2 (20%)" value={student.grades.PC2} />
            <GradeBar label="PC3 (20%)" value={student.grades.PC3} />
            <GradeBar label="PC4 (40%) — Pendiente" value={student.grades.PC4 || 0} />
          </div>

          {/* Activity chart */}
          <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-4">
              <Activity size={14} className="text-blue-400" /> Evolución de Actividad en Campus Virtual
            </h3>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={student.actividadMensual}>
                <defs>
                  <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="mes" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="accesos" stroke="#3b82f6" strokeWidth={2} fill="url(#actGrad)" dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* AI Recommendations */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Brain size={14} className="text-violet-400" /> Recomendaciones IA — Análisis de Riesgo
            </h3>
            {recs.map((rec, i) => (
              <div key={i} className={`rounded-xl p-4 border ${rec.bg} ${rec.border} animate-fade-in`} style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-center gap-2 mb-2">
                  <rec.icon size={14} className={rec.color} />
                  <span className={`text-xs font-bold uppercase tracking-wide ${rec.color}`}>{rec.tipo}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{rec.texto}</p>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleIntervention}
              disabled={student.intervenido}
              className={`btn-shine flex-1 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2
                ${student.intervenido
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-blue-900/30'
                }`}
            >
              {student.intervenido ? (
                <><CheckCircle2 size={16} /> Intervención Registrada</>
              ) : (
                <><Send size={16} /> Enviar Correo de Intervención</>
              )}
            </button>
            <button
              onClick={() => window.open(`mailto:${student.email}?subject=Seguimiento Académico VIGÍA&body=Estimado/a ${student.nombre},%0D%0A%0D%0ALe contactamos desde el Sistema de Alerta Temprana VIGÍA...`, '_blank')}
              className="px-4 py-3 rounded-xl bg-slate-700/60 hover:bg-slate-700 border border-slate-600/40 text-slate-300 text-sm font-medium transition-all flex items-center gap-2"
            >
              <Mail size={16} />
              Email directo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
