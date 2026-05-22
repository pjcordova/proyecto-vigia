import React, { useState, useMemo } from 'react';
import {
  Users, BookOpen, BarChart2, Plus, Trash2, Edit3, Save, X,
  AlertTriangle, Shield, ArrowLeft, Search, ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import RiskBadge from '../components/ui/RiskBadge.jsx';
import { calcPromedio, notaVisual, calcRiesgo } from '../data/dataset.js';

// ── Tab button ───────────────────────────────────────────────
function TabBtn({ active, onClick, icon: Icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
        active
          ? 'bg-blue-500/20 border border-blue-500/40 text-blue-400'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
      }`}
    >
      <Icon size={15} />
      {label}
      {count !== undefined && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-blue-500/30 text-blue-300' : 'bg-slate-700 text-slate-400'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

// ── Input field helper ───────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-slate-800/80 border border-slate-600/50 focus:border-blue-500/70 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition-all";

// ── Students Tab ─────────────────────────────────────────────
function StudentsTab() {
  const { state, actions } = useApp();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);   // student codigo being edited
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ codigo: '', nombre: '', carrera: '', ciclo: '', asistencia: 75, actividadDias: 5, PC1: 0, PC2: 0, PC3: 0, PC4: 0, cursoId: 'SIST101' });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return state.students.filter(s =>
      s.nombre.toLowerCase().includes(q) || s.codigo.toLowerCase().includes(q)
    );
  }, [state.students, search]);

  const handleAdd = () => {
    if (!form.codigo || !form.nombre) return;
    actions.addStudent({ ...form, PC1: +form.PC1, PC2: +form.PC2, PC3: +form.PC3, PC4: +form.PC4, asistencia: +form.asistencia, actividadDias: +form.actividadDias });
    setShowAdd(false);
    setForm({ codigo: '', nombre: '', carrera: '', ciclo: '', asistencia: 75, actividadDias: 5, PC1: 0, PC2: 0, PC3: 0, PC4: 0, cursoId: 'SIST101' });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o código U..." className={`${inputCls} pl-8`} />
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all">
          <Plus size={15} /> Agregar Alumno
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="glass-card rounded-xl p-5 border border-blue-500/30 animate-fade-in space-y-4">
          <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2"><Plus size={14} /> Nuevo Estudiante</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Field label="Código U"><input value={form.codigo} onChange={e => setForm(p => ({ ...p, codigo: e.target.value.toUpperCase() }))} placeholder="U23123456" className={inputCls} /></Field>
            <Field label="Nombre completo"><input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Nombre Apellido" className={inputCls} /></Field>
            <Field label="Carrera"><input value={form.carrera} onChange={e => setForm(p => ({ ...p, carrera: e.target.value }))} placeholder="Ingeniería de Sistemas" className={inputCls} /></Field>
            <Field label="Ciclo"><input value={form.ciclo} onChange={e => setForm(p => ({ ...p, ciclo: e.target.value }))} placeholder="2do" className={inputCls} /></Field>
            <Field label="Asistencia %"><input type="number" min="0" max="100" value={form.asistencia} onChange={e => setForm(p => ({ ...p, asistencia: e.target.value }))} className={inputCls} /></Field>
            <Field label="Días inactivo"><input type="number" min="0" value={form.actividadDias} onChange={e => setForm(p => ({ ...p, actividadDias: e.target.value }))} className={inputCls} /></Field>
            <Field label="PC1"><input type="number" min="0" max="20" value={form.PC1} onChange={e => setForm(p => ({ ...p, PC1: e.target.value }))} className={inputCls} /></Field>
            <Field label="PC2"><input type="number" min="0" max="20" value={form.PC2} onChange={e => setForm(p => ({ ...p, PC2: e.target.value }))} className={inputCls} /></Field>
            <Field label="PC3"><input type="number" min="0" max="20" value={form.PC3} onChange={e => setForm(p => ({ ...p, PC3: e.target.value }))} className={inputCls} /></Field>
            <Field label="PC4"><input type="number" min="0" max="20" value={form.PC4} onChange={e => setForm(p => ({ ...p, PC4: e.target.value }))} className={inputCls} /></Field>
            <Field label="Curso">
              <select value={form.cursoId} onChange={e => setForm(p => ({ ...p, cursoId: e.target.value }))} className={inputCls}>
                {state.courses.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </Field>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-all"><Save size={14} /> Guardar</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-all">Cancelar</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-700/30">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/40 bg-slate-800/60">
              {['Código', 'Nombre', 'Riesgo', 'PC1', 'PC2', 'PC3', 'PC4', 'Promedio', 'Asist.', 'Acciones'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/20">
            {filtered.map(s => (
              <StudentRow key={s.codigo} student={s} editing={editing} setEditing={setEditing} actions={actions} courses={state.courses} />
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-slate-500 text-sm">No se encontraron estudiantes</div>
        )}
      </div>
    </div>
  );
}

function StudentRow({ student: s, editing, setEditing, actions, courses }) {
  const isEditing = editing === s.codigo;
  const [vals, setVals] = useState({ PC1: s.grades.PC1, PC2: s.grades.PC2, PC3: s.grades.PC3, PC4: s.grades.PC4, asistencia: s.asistencia, actividadDias: s.actividadDias });

  const handleSave = () => {
    actions.updateStudent(s.codigo, {
      grades: { PC1: +vals.PC1, PC2: +vals.PC2, PC3: +vals.PC3, PC4: +vals.PC4 },
      PC1: +vals.PC1, PC2: +vals.PC2, PC3: +vals.PC3, PC4: +vals.PC4,
      asistencia: +vals.asistencia,
      actividadDias: +vals.actividadDias,
    });
    setEditing(null);
  };

  const miniInput = (field) => (
    <input
      type="number" min="0" max={field === 'asistencia' ? 100 : 20}
      value={vals[field]}
      onChange={e => setVals(p => ({ ...p, [field]: e.target.value }))}
      className="w-14 bg-slate-700 border border-blue-500/40 rounded px-1.5 py-1 text-xs text-white outline-none text-center"
    />
  );

  return (
    <tr className={`transition-all ${isEditing ? 'bg-blue-500/5' : 'hover:bg-slate-800/30'}`}>
      <td className="px-4 py-3 font-mono text-xs text-slate-400">{s.codigo}</td>
      <td className="px-4 py-3 font-medium text-slate-200 whitespace-nowrap">{s.nombre.split(' ').slice(0, 3).join(' ')}</td>
      <td className="px-4 py-3"><RiskBadge level={s.riesgo} size="xs" /></td>
      <td className="px-4 py-2">{isEditing ? miniInput('PC1') : <span className={s.grades.PC1 >= 12 ? 'text-emerald-400' : 'text-red-400'}>{s.grades.PC1}</span>}</td>
      <td className="px-4 py-2">{isEditing ? miniInput('PC2') : <span className={s.grades.PC2 >= 12 ? 'text-emerald-400' : 'text-red-400'}>{s.grades.PC2}</span>}</td>
      <td className="px-4 py-2">{isEditing ? miniInput('PC3') : <span className={s.grades.PC3 >= 12 ? 'text-emerald-400' : 'text-red-400'}>{s.grades.PC3}</span>}</td>
      <td className="px-4 py-2">{isEditing ? miniInput('PC4') : <span className="text-slate-500">{s.grades.PC4}</span>}</td>
      <td className="px-4 py-3 font-bold font-mono text-sm">
        <span className={s.notaFinal >= 12 ? 'text-emerald-400' : s.notaFinal >= 10 ? 'text-amber-400' : 'text-red-400'}>{s.notaFinal}</span>
      </td>
      <td className="px-4 py-2">{isEditing ? miniInput('asistencia') : <span className={s.asistencia >= 75 ? 'text-emerald-400' : 'text-amber-400'}>{s.asistencia}%</span>}</td>
      <td className="px-4 py-2">
        <div className="flex items-center gap-1">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="p-1.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all"><Save size={13} /></button>
              <button onClick={() => setEditing(null)} className="p-1.5 rounded bg-slate-700 text-slate-400 hover:bg-slate-600 transition-all"><X size={13} /></button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(s.codigo)} className="p-1.5 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"><Edit3 size={13} /></button>
              <button onClick={() => { if (confirm(`¿Eliminar a ${s.nombre}?`)) actions.deleteStudent(s.codigo); }} className="p-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"><Trash2 size={13} /></button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Courses Tab ──────────────────────────────────────────────
function CoursesTab() {
  const { state, actions } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ id: '', nombre: '', codigo: '', seccion: '', ciclo: '2026-I', horario: '', aula: '', alumnos: 0, creditos: 3 });
  const [editForm, setEditForm] = useState({});

  const handleAdd = () => {
    if (!form.id || !form.nombre) return;
    actions.addCourse(form);
    setShowAdd(false);
    setForm({ id: '', nombre: '', codigo: '', seccion: '', ciclo: '2026-I', horario: '', aula: '', alumnos: 0, creditos: 3 });
  };

  const startEdit = (c) => { setEditing(c.id); setEditForm({ ...c }); };
  const saveEdit = () => { actions.updateCourse(editing, editForm); setEditing(null); };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all">
          <Plus size={15} /> Agregar Curso
        </button>
      </div>

      {showAdd && (
        <div className="glass-card rounded-xl p-5 border border-blue-500/30 animate-fade-in space-y-4">
          <h3 className="text-sm font-bold text-blue-400">Nuevo Curso</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[['id', 'ID único'], ['nombre', 'Nombre del curso'], ['codigo', 'Código'], ['seccion', 'Sección'], ['ciclo', 'Ciclo'], ['horario', 'Horario'], ['aula', 'Aula']].map(([key, label]) => (
              <Field key={key} label={label}>
                <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} className={inputCls} />
              </Field>
            ))}
            <Field label="Créditos"><input type="number" value={form.creditos} onChange={e => setForm(p => ({ ...p, creditos: +e.target.value }))} className={inputCls} /></Field>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold"><Save size={14} /> Guardar</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm">Cancelar</button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {state.courses.map(c => (
          <div key={c.id} className="glass-card rounded-xl p-5 border border-slate-700/30">
            {editing === c.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[['nombre', 'Nombre'], ['seccion', 'Sección'], ['horario', 'Horario'], ['aula', 'Aula'], ['ciclo', 'Ciclo']].map(([key, label]) => (
                    <Field key={key} label={label}>
                      <input value={editForm[key] || ''} onChange={e => setEditForm(p => ({ ...p, [key]: e.target.value }))} className={inputCls} />
                    </Field>
                  ))}
                  <Field label="Créditos"><input type="number" value={editForm.creditos} onChange={e => setEditForm(p => ({ ...p, creditos: +e.target.value }))} className={inputCls} /></Field>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold"><Save size={13} /> Guardar</button>
                  <button onClick={() => setEditing(null)} className="px-3 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm">Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-400">{c.codigo}</span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs text-slate-500">Sección {c.seccion}</span>
                  </div>
                  <h3 className="font-bold text-white">{c.nombre}</h3>
                  <p className="text-xs text-slate-500 mt-1">{c.horario} · {c.aula} · {c.creditos} créditos</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(c)} className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"><Edit3 size={14} /></button>
                  <button onClick={() => { if (confirm('¿Eliminar este curso?')) actions.deleteCourse(c.id); }} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"><Trash2 size={14} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Grades Tab ───────────────────────────────────────────────
function GradesTab() {
  const { state, actions } = useApp();
  const [selectedCourse, setSelectedCourse] = useState(state.courses[0]?.id || '');
  const [saving, setSaving] = useState(null);

  const courseStudents = useMemo(
    () => state.students.filter(s => s.cursoId === selectedCourse),
    [state.students, selectedCourse]
  );

  const handleGradeChange = (codigo, pc, value) => {
    const num = Math.min(20, Math.max(0, +value));
    const student = state.students.find(s => s.codigo === codigo);
    if (!student) return;
    const newGrades = { ...student.grades, [pc]: num };
    actions.updateStudent(codigo, { grades: newGrades, [pc]: num });
    setSaving(codigo);
    setTimeout(() => setSaving(null), 800);
  };

  return (
    <div className="space-y-4">
      {/* Course selector */}
      <div className="flex items-center gap-3">
        <Field label="Seleccionar Curso">
          <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className={`${inputCls} w-auto min-w-64`}>
            {state.courses.map(c => <option key={c.id} value={c.id}>{c.nombre} — {c.seccion}</option>)}
          </select>
        </Field>
        <div className="mt-5 flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <AlertTriangle size={13} className="text-amber-400" />
          <span className="text-xs text-amber-300">Los cambios se reflejan en el Dashboard en tiempo real</span>
        </div>
      </div>

      {/* Grades table */}
      <div className="overflow-x-auto rounded-xl border border-slate-700/30">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800/60 border-b border-slate-700/40">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Alumno</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Código</th>
              {['PC1 (20%)', 'PC2 (20%)', 'PC3 (20%)', 'PC4 (40%)'].map(h => (
                <th key={h} className="text-center px-4 py-3 text-xs font-semibold text-blue-400 uppercase">{h}</th>
              ))}
              <th className="text-center px-4 py-3 text-xs font-semibold text-emerald-400 uppercase">Promedio</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Riesgo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/20">
            {courseStudents.map(s => (
              <tr key={s.codigo} className={`transition-all ${saving === s.codigo ? 'bg-emerald-500/5' : 'hover:bg-slate-800/20'}`}>
                <td className="px-4 py-3 font-medium text-slate-200 whitespace-nowrap">{s.nombre.split(' ').slice(0, 2).join(' ')}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{s.codigo}</td>
                {['PC1', 'PC2', 'PC3', 'PC4'].map(pc => (
                  <td key={pc} className="px-3 py-2 text-center">
                    <input
                      type="number" min="0" max="20" step="0.5"
                      defaultValue={s.grades[pc]}
                      onBlur={e => handleGradeChange(s.codigo, pc, e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleGradeChange(s.codigo, pc, e.target.value)}
                      className={`w-16 text-center bg-slate-800 border rounded-lg px-2 py-1.5 text-sm font-mono outline-none transition-all
                        ${s.grades[pc] >= 12 ? 'border-emerald-500/30 text-emerald-400' : s.grades[pc] >= 10 ? 'border-amber-500/30 text-amber-400' : 'border-red-500/30 text-red-400'}
                        focus:border-blue-500/60 focus:text-white`}
                    />
                  </td>
                ))}
                <td className="px-4 py-3 text-center font-black text-base font-mono">
                  <span className={s.notaFinal >= 12 ? 'text-emerald-400' : s.notaFinal >= 10 ? 'text-amber-400' : 'text-red-400'}>
                    {s.notaFinal}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <RiskBadge level={s.riesgo} size="xs" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {courseStudents.length === 0 && (
          <div className="text-center py-10 text-slate-500 text-sm">No hay estudiantes en este curso</div>
        )}
      </div>
    </div>
  );
}

// ── Main Admin Page ──────────────────────────────────────────
export default function AdminPage() {
  const { state, actions } = useApp();
  const { adminTab } = state;

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <button onClick={actions.goDashboard} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-3 transition-colors">
          <ArrowLeft size={15} /> Volver al Dashboard
        </button>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={18} className="text-blue-400" />
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Panel Protegido</span>
            </div>
            <h1 className="text-2xl font-black text-white">Panel Administrativo</h1>
            <p className="text-sm text-slate-400 mt-0.5">CRUD completo · Los cambios se propagan instantáneamente al Dashboard</p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs text-blue-400 font-semibold">Modo Admin — {state.teacher.codigo}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 p-1 bg-slate-800/40 rounded-xl border border-slate-700/30 w-fit">
        <TabBtn active={adminTab === 'students'} onClick={() => actions.setAdminTab('students')} icon={Users} label="Estudiantes" count={state.students.length} />
        <TabBtn active={adminTab === 'courses'} onClick={() => actions.setAdminTab('courses')} icon={BookOpen} label="Cursos" count={state.courses.length} />
        <TabBtn active={adminTab === 'grades'} onClick={() => actions.setAdminTab('grades')} icon={BarChart2} label="Notas en Vivo" />
      </div>

      {/* Content */}
      <div className="animate-fade-in">
        {adminTab === 'students' && <StudentsTab />}
        {adminTab === 'courses' && <CoursesTab />}
        {adminTab === 'grades' && <GradesTab />}
      </div>
    </div>
  );
}
