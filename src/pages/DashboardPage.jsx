import React, { useMemo } from 'react';
import { BookOpen, Users, Clock, AlertTriangle, TrendingUp, Star, ChevronRight, Calendar, Award } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import RiskBadge from '../components/ui/RiskBadge.jsx';

function StatPill({ icon: Icon, label, value, color }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/40`}>
      <Icon size={14} className={color} />
      <span className="text-xs text-slate-400">{label}:</span>
      <span className={`text-xs font-bold ${color}`}>{value}</span>
    </div>
  );
}

function CourseCard({ course, onClick }) {
  const { state } = useApp();

  const courseStudents = useMemo(
    () => state.students.filter(s => s.cursoId === course.id),
    [state.students, course.id]
  );

  const stats = useMemo(() => {
    const total = courseStudents.length;
    const criticos = courseStudents.filter(s => s.riesgo === 'CRITICO').length;
    const altos = courseStudents.filter(s => s.riesgo === 'ALTO').length;
    const aprobados = courseStudents.filter(s => s.notaFinal >= 12).length;
    const promedio = total > 0
      ? (courseStudents.reduce((acc, s) => acc + s.promedio, 0) / total).toFixed(1)
      : '—';
    const asistenciaAvg = total > 0
      ? Math.round(courseStudents.reduce((acc, s) => acc + s.asistencia, 0) / total)
      : 0;
    return { total, criticos, altos, aprobados, promedio, asistenciaAvg };
  }, [courseStudents]);

  const riskLevel = stats.criticos > 3 ? 'CRITICO' : stats.criticos > 0 || stats.altos > 2 ? 'ALTO' : stats.altos > 0 ? 'MEDIO' : 'BAJO';
  const healthPct = stats.total > 0 ? Math.round((stats.aprobados / stats.total) * 100) : 0;

  return (
    <div
      onClick={() => onClick(course)}
      className="glass-card rounded-2xl p-6 cursor-pointer group hover:border-blue-500/40 hover:shadow-blue-900/20 hover:shadow-xl transition-all duration-300 border border-slate-700/30 hover:-translate-y-1"
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded">
              {course.codigo} · {course.seccion}
            </span>
            <RiskBadge level={riskLevel} size="xs" />
          </div>
          <h3 className="text-base font-bold text-slate-100 group-hover:text-blue-300 transition-colors leading-snug">
            {course.nombre}
          </h3>
        </div>
        <div className="ml-3 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20 transition-all flex-shrink-0">
          <BookOpen size={20} className="text-blue-400" />
        </div>
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap gap-2 mb-5">
        <StatPill icon={Calendar} label="Horario" value={course.horario} color="text-slate-400" />
        <StatPill icon={Award} label="Créditos" value={`${course.creditos} cr`} color="text-violet-400" />
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="text-center">
          <p className="text-xl font-black text-white">{stats.total}</p>
          <p className="text-xs text-slate-500 mt-0.5">Alumnos</p>
        </div>
        <div className="text-center">
          <p className={`text-xl font-black ${stats.criticos > 0 ? 'text-red-400' : 'text-slate-400'}`}>{stats.criticos}</p>
          <p className="text-xs text-slate-500 mt-0.5">Críticos</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-black text-white">{stats.promedio}</p>
          <p className="text-xs text-slate-500 mt-0.5">Promedio</p>
        </div>
        <div className="text-center">
          <p className={`text-xl font-black ${stats.asistenciaAvg < 65 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {stats.asistenciaAvg}%
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Asistencia</p>
        </div>
      </div>

      {/* Health bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Salud académica del aula</span>
          <span className={`font-semibold ${healthPct >= 70 ? 'text-emerald-400' : healthPct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
            {healthPct}%
          </span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              healthPct >= 70 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
              healthPct >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
              'bg-gradient-to-r from-red-600 to-red-400'
            }`}
            style={{ width: `${healthPct}%` }}
          />
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-end mt-4 pt-3 border-t border-slate-700/40">
        <span className="text-xs text-blue-400 font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
          Ver sección completa <ChevronRight size={14} />
        </span>
      </div>
    </div>
  );
}

// Global stats banner
function GlobalKPIs() {
  const { state } = useApp();

  const stats = useMemo(() => {
    const total = state.students.length;
    const criticos = state.students.filter(s => s.riesgo === 'CRITICO').length;
    const altos = state.students.filter(s => s.riesgo === 'ALTO').length;
    const aprobados = state.students.filter(s => s.notaFinal >= 12).length;
    const abandono = state.students.filter(s => s.actividadDias > 14).length;
    return { total, criticos, altos, aprobados, abandono };
  }, [state.students]);

  const kpis = [
    { label: 'Total Estudiantes', value: stats.total, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'Riesgo Crítico', value: stats.criticos, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    { label: 'Riesgo Alto', value: stats.altos, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { label: 'Posible Abandono', value: stats.abandono, icon: Clock, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
    { label: 'Aprobados', value: stats.aprobados, icon: Star, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
      {kpis.map(kpi => (
        <div key={kpi.label} className={`glass-card rounded-xl p-4 border ${kpi.border} ${kpi.bg} animate-fade-in`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-400 font-medium leading-tight">{kpi.label}</p>
            <kpi.icon size={16} className={kpi.color} />
          </div>
          <p className={`text-3xl font-black ${kpi.color}`}>{kpi.value}</p>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { state, actions } = useApp();
  const { teacher, courses } = state;

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Welcome banner */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-blue-400 font-semibold uppercase tracking-widest mb-1">
              Bienvenido de vuelta
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {teacher.nombre}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {teacher.departamento} · {teacher.cargo} · Ciclo 2026-I
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-400 font-semibold">Sistema activo</span>
          </div>
        </div>
      </div>

      {/* Global KPIs */}
      <GlobalKPIs />

      {/* Course grid */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Mis Secciones</h2>
          <p className="text-sm text-slate-500">{courses.length} cursos asignados este ciclo</p>
        </div>
        <button
          onClick={actions.goAdmin}
          className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center gap-1"
        >
          Gestionar cursos <ChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {courses.map((course, i) => (
          <div key={course.id} style={{ animationDelay: `${i * 80}ms` }} className="animate-fade-in">
            <CourseCard course={course} onClick={actions.selectCourse} />
          </div>
        ))}
      </div>
    </div>
  );
}
