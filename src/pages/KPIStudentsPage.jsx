import React, { useState, useMemo, lazy, Suspense } from 'react';
import { Search, Users, ArrowLeft, SortAsc, ChevronUp, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import RiskBadge from '../components/ui/RiskBadge.jsx';
import { SkeletonStudentRow } from '../components/ui/Skeleton.jsx';

const StudentModal = lazy(() => import('../components/students/StudentModal.jsx'));

// ── Student Row ───────────────────────────────────────────────
function StudentRow({ student, courseName, onSelect, index }) {
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
        <div className="flex items-center gap-2">
          <p className="text-xs font-mono text-slate-500">{student.codigo}</p>
          <span className="text-slate-600 text-xs">•</span>
          <p className="text-xs text-slate-400 truncate">{courseName}</p>
        </div>
      </div>

      {/* Risk */}
      <div className="hidden sm:block flex-shrink-0">
        <RiskBadge level={student.riesgo} size="xs" pulse={student.riesgo === 'CRITICO'} />
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

export default function KPIStudentsPage() {
  const { state, actions } = useApp();
  const { students, courses, kpiFilter } = state;

  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('riesgo');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Lazy loading states
  const [showList, setShowList] = useState(false);
  const [isListLoading, setIsListLoading] = useState(false);

  const kpiTitle = useMemo(() => {
    switch(kpiFilter) {
      case 'CRITICO': return 'Estudiantes en Riesgo Crítico';
      case 'ALTO': return 'Estudiantes en Riesgo Alto';
      case 'ABANDONO': return 'Estudiantes en Posible Abandono';
      case 'APROBADOS': return 'Estudiantes Aprobados';
      default: return 'Todos los Estudiantes';
    }
  }, [kpiFilter]);

  const kpiDescription = useMemo(() => {
    switch(kpiFilter) {
      case 'CRITICO': return 'Alumnos con promedio < 10 o inactividad severa.';
      case 'ALTO': return 'Alumnos con promedio entre 10 y 11.5 o baja asistencia.';
      case 'ABANDONO': return 'Alumnos sin actividad en plataforma por más de 14 días.';
      case 'APROBADOS': return 'Alumnos con rendimiento satisfactorio (≥ 12).';
      default: return 'Listado completo de estudiantes sin filtros aplicados.';
    }
  }, [kpiFilter]);

  const baseFilteredStudents = useMemo(() => {
    let list = students;
    if (kpiFilter === 'CRITICO') list = list.filter(s => s.riesgo === 'CRITICO');
    else if (kpiFilter === 'ALTO') list = list.filter(s => s.riesgo === 'ALTO');
    else if (kpiFilter === 'ABANDONO') list = list.filter(s => s.actividadDias > 14);
    else if (kpiFilter === 'APROBADOS') list = list.filter(s => s.notaFinal >= 12);
    return list;
  }, [students, kpiFilter]);

  const filteredAndSorted = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = baseFilteredStudents;

    if (q) {
      list = list.filter(s =>
        s.nombre.toLowerCase().includes(q) ||
        s.codigo.toLowerCase().includes(q)
      );
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
  }, [baseFilteredStudents, search, sortField, sortAsc]);

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

  const getCourseName = (cursoId) => {
    const c = courses.find(course => course.id === cursoId);
    return c ? c.nombre : 'Desconocido';
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 animate-fade-in">
        <div>
          <button
            onClick={actions.goDashboard}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-3 transition-colors"
          >
            <ArrowLeft size={15} /> Volver al Dashboard
          </button>
          <h1 className="text-2xl font-black text-white leading-tight">{kpiTitle}</h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            <p className="text-sm text-slate-400">
              {kpiDescription}
            </p>
            <div className="hidden sm:flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-slate-700" />
              <p className="text-sm font-bold text-blue-400">
                {baseFilteredStudents.length} estudiantes detectados
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Student list */}
      <div className="glass-card rounded-2xl border border-slate-700/30 overflow-hidden">
        <div className="p-5 border-b border-slate-700/30 bg-slate-900/20">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users size={16} className="text-blue-400" />
              Alumnos Encontrados
              <span className="text-sm font-normal text-slate-500">({filteredAndSorted.length})</span>
            </h2>
          </div>

          {/* Search & Sort - Solo visibles si la lista está cargada */}
          {showList && (
            <div className="animate-fade-in">
              {/* Search */}
              <div className="relative mt-3">
                <Search size={16} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar por nombre o código U..."
                  className="input-glow w-full bg-slate-800/60 border border-slate-600/40 focus:border-blue-500/60 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-3 text-slate-500 hover:text-slate-300">
                    ✕
                  </button>
                )}
              </div>

              {/* Sort buttons */}
              <div className="flex items-center gap-2 mt-3">
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
            </div>
          )}
        </div>

        {/* List body */}
        <div className="p-4 space-y-2 max-h-[70vh] overflow-y-auto custom-scrollbar min-h-[350px] flex flex-col">
          {!showList ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
              <div className="h-20 w-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                <Users size={32} className="text-blue-400" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">Vista de Alumnos Protegida</h3>
              <p className="text-sm text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
                Para garantizar un rendimiento óptimo en el sistema VIGÍA, la lista de <span className="text-blue-400 font-bold">{filteredAndSorted.length} estudiantes</span> filtrados se cargará bajo demanda.
              </p>
              <button 
                onClick={handleToggleList}
                className="group relative px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Cargar lista de estudiantes
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
              </button>
            </div>
          ) : isListLoading ? (
            <div className="space-y-3 p-2">
              {[...Array(6)].map((_, i) => <SkeletonStudentRow key={i} />)}
            </div>
          ) : filteredAndSorted.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Search size={32} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No se encontraron alumnos</p>
            </div>
          ) : (
            <>
              <div className="flex justify-end mb-2 px-2">
                <button 
                  onClick={handleToggleList}
                  className="text-xs text-slate-500 hover:text-blue-400 transition-colors flex items-center gap-1.5 font-medium"
                >
                  Ocultar lista <ChevronUp size={12} />
                </button>
              </div>
              {filteredAndSorted.map((s, i) => (
                <StudentRow 
                  key={s.codigo} 
                  student={s} 
                  courseName={getCourseName(s.cursoId)}
                  onSelect={setSelectedStudent} 
                  index={i} 
                />
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
