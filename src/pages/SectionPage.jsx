import React, { useState, useMemo, lazy, Suspense } from 'react';
import {
  Search, Filter, Users, AlertTriangle, Clock, TrendingUp, Award,
  ArrowLeft, BarChart2, Activity, ChevronUp, ChevronDown, SortAsc
} from 'lucide-react';
import {
  RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { useApp } from '../context/AppContext.jsx';
import RiskBadge, { RISK_CONFIG } from '../components/ui/RiskBadge.jsx';
import { SkeletonStudentRow, SkeletonKPI } from '../components/ui/Skeleton.jsx';

const StudentModal = lazy(() => import('../components/students/StudentModal.jsx'));

// ── KPI Card ─────────────────────────────────────────────────
function KPICard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className={`glass-card rounded-xl p-5 border border-slate-700/30 animate-fade-in`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-').replace('400', '500/10')}`}>
          <Icon size={16} className={color} />
        </div>
      </div>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1.5">{sub}</p>}
    </div>
  );
}

// ── Recharts Custom Tooltip ───────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-xs">
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="text-blue-400 font-bold">{payload[0].value} alumnos</p>
      </div>
    );
  }
  return null;
};

// ── Charts Panel ─────────────────────────────────────────────
function ChartsPanel({ students }) {
  const riskDist = useMemo(() => {
    const counts = { CRITICO: 0, ALTO: 0, MEDIO: 0, BAJO: 0 };
    students.forEach(s => { counts[s.riesgo] = (counts[s.riesgo] || 0) + 1; });
    return [
      { name: 'Crítico', value: counts.CRITICO, fill: '#ef4444' },
      { name: 'Alto', value: counts.ALTO, fill: '#f59e0b' },
      { name: 'Medio', value: counts.MEDIO, fill: '#eab308' },
      { name: 'Bajo', value: counts.BAJO, fill: '#22c55e' },
    ];
  }, [students]);

  const gradeDist = useMemo(() => {
    const buckets = [
      { rango: '0-5', count: 0 }, { rango: '6-8', count: 0 },
      { rango: '9-11', count: 0 }, { rango: '12-14', count: 0 },
      { rango: '15-17', count: 0 }, { rango: '18-20', count: 0 },
    ];
    students.forEach(s => {
      const p = s.promedio;
      if (p <= 5) buckets[0].count++;
      else if (p <= 8) buckets[1].count++;
      else if (p <= 11) buckets[2].count++;
      else if (p <= 14) buckets[3].count++;
      else if (p <= 17) buckets[4].count++;
      else buckets[5].count++;
    });
    return buckets;
  }, [students]);

  const avgAsistencia = students.length > 0
    ? Math.round(students.reduce((a, s) => a + s.asistencia, 0) / students.length)
    : 0;

  const asistenciaData = [{ name: 'Asistencia', value: avgAsistencia, fill: avgAsistencia >= 75 ? '#22c55e' : avgAsistencia >= 65 ? '#f59e0b' : '#ef4444' }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
      {/* Risk distribution donut */}
      <div className="glass-card rounded-xl p-5 border border-slate-700/30">
        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-400" /> Distribución de Riesgo
        </h3>
        <div className="flex items-center gap-4">
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie data={riskDist} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={2}>
                {riskDist.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 flex-1">
            {riskDist.map(r => (
              <div key={r.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full" style={{ background: r.fill }} />
                  <span className="text-slate-400">{r.name}</span>
                </div>
                <span className="font-bold text-white">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grade distribution bars */}
      <div className="glass-card rounded-xl p-5 border border-slate-700/30">
        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <BarChart2 size={14} className="text-blue-400" /> Distribución de Promedios
        </h3>
        <ResponsiveContainer width="100%" height={110}>
          <BarChart data={gradeDist} barSize={14}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="rango" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} width={20} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="#3b82f6" radius={[3, 3, 0, 0]}>
              {gradeDist.map((entry, i) => (
                <Cell key={i} fill={entry.rango.startsWith('12') || entry.rango.startsWith('15') || entry.rango.startsWith('18') ? '#22c55e' : '#3b82f6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Attendance radial */}
      <div className="glass-card rounded-xl p-5 border border-slate-700/30 flex flex-col items-center justify-center">
        <h3 className="text-sm font-semibold text-slate-300 mb-2 self-start flex items-center gap-2">
          <Activity size={14} className="text-violet-400" /> Asistencia Promedio
        </h3>
        <div className="relative">
          <ResponsiveContainer width={130} height={130}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="55%" outerRadius="80%" startAngle={90} endAngle={-270} data={asistenciaData}>
              <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#1e293b' }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-black ${avgAsistencia >= 75 ? 'text-emerald-400' : avgAsistencia >= 65 ? 'text-amber-400' : 'text-red-400'}`}>
              {avgAsistencia}%
            </span>
            <span className="text-xs text-slate-500">del aula</span>
          </div>
        </div>
        <p className="text-xs text-center text-slate-500">
          {avgAsistencia >= 75 ? '✓ Asistencia saludable' : avgAsistencia >= 65 ? '⚠ Asistencia en riesgo' : '⛔ Asistencia crítica'}
        </p>
      </div>
    </div>
  );
}

// ── Top 5 Critical ────────────────────────────────────────────
function Top5Critical({ students, onSelect }) {
  const top5 = useMemo(() =>
    [...students]
      .filter(s => s.riesgo === 'CRITICO' || s.riesgo === 'ALTO')
      .sort((a, b) => a.promedio - b.promedio)
      .slice(0, 5),
    [students]
  );

  if (top5.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
        <AlertTriangle size={14} /> Top 5 Alumnos en Riesgo Crítico
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {top5.map((s, i) => (
          <button
            key={s.codigo}
            onClick={() => onSelect(s)}
            className="glass-card rounded-xl p-4 border border-red-500/20 hover:border-red-500/50 transition-all text-left group hover:-translate-y-1"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {i + 1}
              </div>
              <RiskBadge level={s.riesgo} size="xs" />
            </div>
            <p className="text-xs font-semibold text-slate-200 leading-tight mb-1 group-hover:text-white">
              {s.nombre.split(' ').slice(0, 2).join(' ')}
            </p>
            <p className="text-xs font-mono text-slate-500">{s.codigo}</p>
            <div className="mt-3 pt-2 border-t border-slate-700/40">
              <p className="text-lg font-black text-red-400">{s.promedio.toFixed(1)}</p>
              <p className="text-xs text-slate-500">promedio</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Student Row ───────────────────────────────────────────────
function StudentRow({ student, onSelect, index }) {
  const isAbandono = student.actividadDias > 14;
  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer group hover:-translate-y-0.5
        ${student.riesgo === 'CRITICO'
          ? 'border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5'
          : 'border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-800/30'
        } glass-card animate-fade-in`}
      style={{ animationDelay: `${index * 30}ms` }}
      onClick={() => onSelect(student)}
    >
      {/* Avatar */}
      <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0
        ${student.riesgo === 'CRITICO' ? 'bg-gradient-to-br from-red-500 to-red-700' :
          student.riesgo === 'ALTO' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
          student.riesgo === 'MEDIO' ? 'bg-gradient-to-br from-blue-500 to-blue-700' :
          'bg-gradient-to-br from-emerald-500 to-teal-600'}`}
      >
        {student.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')}
      </div>

      {/* Name + code */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-200 group-hover:text-white truncate">{student.nombre}</p>
          {isAbandono && (
            <span className="text-xs px-1.5 py-0.5 bg-violet-500/20 border border-violet-500/30 text-violet-400 rounded font-medium flex-shrink-0">
              Abandono
            </span>
          )}
          {student.intervenido && (
            <span className="text-xs px-1.5 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded font-medium flex-shrink-0">
              ✓ Interv.
            </span>
          )}
        </div>
        <p className="text-xs font-mono text-slate-500">{student.codigo}</p>
      </div>

      {/* Risk */}
      <div className="hidden sm:block flex-shrink-0">
        <RiskBadge level={student.riesgo} size="xs" pulse={student.riesgo === 'CRITICO'} />
      </div>

      {/* PC grades */}
      <div className="hidden md:flex items-center gap-1 flex-shrink-0">
        {['PC1', 'PC2', 'PC3'].map(pc => (
          <div key={pc} className="text-center w-10">
            <p className={`text-xs font-bold ${student.grades[pc] >= 12 ? 'text-emerald-400' : student.grades[pc] >= 10 ? 'text-amber-400' : 'text-red-400'}`}>
              {student.grades[pc]}
            </p>
            <p className="text-xs text-slate-600">{pc}</p>
          </div>
        ))}
      </div>

      {/* Promedio */}
      <div className="text-right flex-shrink-0 w-16">
        <p className={`text-base font-black ${student.notaFinal >= 12 ? 'text-emerald-400' : student.notaFinal >= 10 ? 'text-amber-400' : 'text-red-400'}`}>
          {student.notaFinal}
        </p>
        <p className="text-xs text-slate-500">promedio</p>
      </div>

      {/* Attendance */}
      <div className="hidden lg:block text-right flex-shrink-0 w-14">
        <p className={`text-sm font-bold ${student.asistencia >= 75 ? 'text-emerald-400' : student.asistencia >= 65 ? 'text-amber-400' : 'text-red-400'}`}>
          {student.asistencia}%
        </p>
        <p className="text-xs text-slate-500">asist.</p>
      </div>
    </div>
  );
}

// ── Main Section Page ─────────────────────────────────────────
export default function SectionPage() {
  const { state, actions } = useApp();
  const { selectedCourse, students } = state;

  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [sortField, setSortField] = useState('riesgo');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Lazy loading states
  const [showList, setShowList] = useState(false);
  const [isListLoading, setIsListLoading] = useState(false);

  const courseStudents = useMemo(
    () => students.filter(s => s.cursoId === selectedCourse?.id),
    [students, selectedCourse]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = courseStudents;

    if (q) {
      list = list.filter(s =>
        s.nombre.toLowerCase().includes(q) ||
        s.codigo.toLowerCase().includes(q)
      );
    }

    if (filterRisk !== 'ALL') {
      list = list.filter(s => s.riesgo === filterRisk);
    }

    const riskOrder = { CRITICO: 0, ALTO: 1, MEDIO: 2, BAJO: 3 };
    list = [...list].sort((a, b) => {
      let va, vb;
      if (sortField === 'riesgo') { va = riskOrder[a.riesgo]; vb = riskOrder[b.riesgo]; }
      else if (sortField === 'nombre') { va = a.nombre; vb = b.nombre; return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va); }
      else if (sortField === 'promedio') { va = a.promedio; vb = b.promedio; }
      else if (sortField === 'asistencia') { va = a.asistencia; vb = b.asistencia; }
      else { va = 0; vb = 0; }
      return sortAsc ? va - vb : vb - va;
    });

    return list;
  }, [courseStudents, search, filterRisk, sortField, sortAsc]);

  const kpis = useMemo(() => ({
    total: courseStudents.length,
    criticos: courseStudents.filter(s => s.riesgo === 'CRITICO').length,
    altos: courseStudents.filter(s => s.riesgo === 'ALTO').length,
    abandono: courseStudents.filter(s => s.actividadDias > 14).length,
    aprobados: courseStudents.filter(s => s.notaFinal >= 12).length,
    promedio: courseStudents.length > 0
      ? (courseStudents.reduce((a, s) => a + s.promedio, 0) / courseStudents.length).toFixed(1)
      : '—',
  }), [courseStudents]);

  const toggleSort = (field) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const SortIcon = ({ field }) => sortField === field
    ? (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />)
    : <SortAsc size={12} className="opacity-30" />;

  const handleToggleList = () => {
    if (!showList) {
      setShowList(true);
      setIsListLoading(true);
      setTimeout(() => setIsListLoading(false), 800); // Simulate network load
    } else {
      setShowList(false);
    }
  };

  if (!selectedCourse) return null;

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Back + title */}
      <div className="flex items-start justify-between mb-6 animate-fade-in">
        <div>
          <button
            onClick={actions.goDashboard}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-3 transition-colors"
          >
            <ArrowLeft size={15} /> Volver al Dashboard
          </button>
          <h1 className="text-2xl font-black text-white">{selectedCourse.nombre}</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {selectedCourse.codigo} · Sección {selectedCourse.seccion} · {selectedCourse.ciclo}
            <span className="mx-2 text-slate-600">·</span>
            {selectedCourse.horario}
            <span className="mx-2 text-slate-600">·</span>
            {selectedCourse.aula}
          </p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <KPICard label="Alumnos" value={kpis.total} icon={Users} color="text-blue-400" sub="matriculados" />
        <KPICard label="Críticos" value={kpis.criticos} icon={AlertTriangle} color="text-red-400" sub="intervención urgente" />
        <KPICard label="Riesgo Alto" value={kpis.altos} icon={TrendingUp} color="text-amber-400" sub="seguimiento activo" />
        <KPICard label="Abandono" value={kpis.abandono} icon={Clock} color="text-violet-400" sub="+14 días inactivos" />
        <KPICard label="Aprobados" value={kpis.aprobados} icon={Award} color="text-emerald-400" sub="nota ≥ 12" />
        <KPICard label="Promedio" value={kpis.promedio} icon={BarChart2} color="text-blue-300" sub="grupo" />
      </div>

      {/* Charts */}
      <ChartsPanel students={courseStudents} />

      {/* Top 5 Critical */}
      <Top5Critical students={courseStudents} onSelect={setSelectedStudent} />

      {/* Student list */}
      <div className="glass-card rounded-2xl border border-slate-700/30">
        {/* List header */}
        <div className="p-5 border-b border-slate-700/30">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users size={16} className="text-blue-400" />
              Lista Completa de Alumnos
              <span className="text-sm font-normal text-slate-500">({filtered.length} de {courseStudents.length})</span>
            </h2>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Risk filter */}
              <div className="flex items-center gap-1">
                {['ALL', 'CRITICO', 'ALTO', 'MEDIO', 'BAJO'].map(r => (
                  <button
                    key={r}
                    onClick={() => setFilterRisk(r)}
                    className={`text-xs px-2 py-1 rounded-lg font-medium transition-all ${
                      filterRisk === r
                        ? 'bg-blue-500/20 border border-blue-500/40 text-blue-400'
                        : 'text-slate-500 hover:text-slate-300 border border-transparent'
                    }`}
                  >
                    {r === 'ALL' ? 'Todos' : r.charAt(0) + r.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search */}
          {showList && (
            <div className="relative mt-3 animate-fade-in">
              <Search size={16} className="absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nombre o código U (ej. U21317697)..."
                className="input-glow w-full bg-slate-800/60 border border-slate-600/40 focus:border-blue-500/60 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-3 text-slate-500 hover:text-slate-300">
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Sort buttons */}
          {showList && (
            <div className="flex items-center gap-2 mt-3 animate-fade-in">
              <span className="text-xs text-slate-600">Ordenar:</span>
              {[['riesgo', 'Riesgo'], ['promedio', 'Promedio'], ['asistencia', 'Asistencia'], ['nombre', 'Nombre']].map(([field, label]) => (
                <button
                  key={field}
                  onClick={() => toggleSort(field)}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all ${
                    sortField === field ? 'text-blue-400 bg-blue-500/10' : 'text-slate-500 hover:text-slate-400'
                  }`}
                >
                  {label} <SortIcon field={field} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* List body */}
        <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto">
          {!showList ? (
            <div className="text-center py-10">
              <div className="h-16 w-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                <Users size={24} className="text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Lista de Alumnos Oculta</h3>
              <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
                Para optimizar el rendimiento, la lista completa de {courseStudents.length} alumnos se carga bajo demanda.
              </p>
              <button 
                onClick={handleToggleList}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
              >
                Cargar lista completa
              </button>
            </div>
          ) : isListLoading ? (
            [...Array(6)].map((_, i) => <SkeletonStudentRow key={i} />)
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Search size={32} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No se encontraron alumnos</p>
              <p className="text-xs mt-1">Intente con otro término de búsqueda</p>
            </div>
          ) : (
            <>
              <div className="flex justify-end mb-2">
                <button 
                  onClick={handleToggleList}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Ocultar lista
                </button>
              </div>
              {filtered.map((s, i) => (
                <StudentRow key={s.codigo} student={s} onSelect={setSelectedStudent} index={i} />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Student modal */}
      {selectedStudent && (
        <Suspense fallback={null}>
          <StudentModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
        </Suspense>
      )}
    </div>
  );
}
