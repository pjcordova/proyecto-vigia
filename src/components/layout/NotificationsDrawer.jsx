import React, { useMemo } from 'react';
import { X, AlertTriangle, TrendingDown, Clock, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import RiskBadge from '../ui/RiskBadge.jsx';

export default function NotificationsDrawer() {
  const { state, actions } = useApp();
  const { isNotificationsOpen, students, courses } = state;

  const notifications = useMemo(() => {
    const alerts = [];
    
    // Sort students by highest risk and lowest grades
    const sortedStudents = [...students].sort((a, b) => a.promedio - b.promedio);

    sortedStudents.forEach((student, index) => {
      // Find course name to add context
      const course = courses.find(c => c.id === student.cursoId);
      const courseName = course ? course.nombre : 'Curso Desconocido';
      
      // Critical Risk Alert
      if (student.riesgo === 'CRITICO' && !student.intervenido) {
        alerts.push({
          id: `crit-${student.codigo}`,
          student,
          courseName,
          type: 'risk_critical',
          title: 'Riesgo Crítico de Deserción',
          icon: AlertTriangle,
          color: 'text-red-400',
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          time: `Hace ${index * 15 + 5} min`
        });
      } 
      // High Risk Alert
      else if (student.riesgo === 'ALTO' && !student.intervenido) {
        alerts.push({
          id: `alto-${student.codigo}`,
          student,
          courseName,
          type: 'risk_high',
          title: 'Riesgo Alto de Deserción',
          icon: AlertTriangle,
          color: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          time: `Hace ${index * 20 + 10} min`
        });
      }

      // Low Performance Alert (notaFinal < 10)
      if (student.notaFinal < 10 && !student.intervenido) {
        alerts.push({
          id: `perf-${student.codigo}`,
          student,
          courseName,
          type: 'performance',
          title: 'Rendimiento Crítico',
          icon: TrendingDown,
          color: 'text-orange-400',
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/30',
          time: `Hace ${index * 12 + 2} min`
        });
      }
    });

    // Limit to latest 15 alerts for performance and UX
    return alerts.slice(0, 15);
  }, [students, courses]);

  if (!isNotificationsOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 transition-opacity animate-fade-in"
        onClick={actions.toggleNotifications}
      />

      {/* Side Panel Drawer */}
      <div 
        className="fixed inset-y-0 right-0 w-full sm:w-[400px] glass-panel border-l border-slate-700/50 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0"
        style={{ animation: 'slideInRight 0.3s forwards' }}
      >
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Centro de Alertas
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {notifications.length}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Alertas en tiempo real del sistema VIGÍA</p>
          </div>
          <button 
            onClick={actions.toggleNotifications}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 space-y-3">
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <AlertTriangle size={32} className="text-emerald-500/50" />
              </div>
              <p className="font-medium text-slate-400">No hay alertas pendientes</p>
              <p className="text-sm">Todos los estudiantes están bajo control.</p>
            </div>
          ) : (
            notifications.map((alert, i) => (
              <div 
                key={alert.id}
                className={`p-4 rounded-xl border ${alert.border} ${alert.bg} flex flex-col gap-3 animate-fade-in group hover:bg-slate-800/80 transition-colors`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Alert Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <alert.icon size={16} className={alert.color} />
                    <span className={`text-xs font-bold uppercase tracking-wider ${alert.color}`}>
                      {alert.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 text-[10px] font-medium">
                    <Clock size={10} />
                    {alert.time}
                  </div>
                </div>

                {/* Student Info */}
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                    {alert.student.nombre}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono text-slate-400">{alert.student.codigo}</span>
                    <span className="text-slate-600 text-xs">•</span>
                    <span className="text-xs text-slate-400 truncate">{alert.courseName}</span>
                  </div>
                </div>

                {/* Metrics snapshot based on alert type */}
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1.5 bg-slate-900/50 px-2 py-1 rounded text-xs">
                    <span className="text-slate-500">Promedio:</span>
                    <span className={`font-bold ${alert.student.notaFinal < 12 ? 'text-red-400' : 'text-slate-300'}`}>
                      {alert.student.notaFinal}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900/50 px-2 py-1 rounded text-xs">
                    <span className="text-slate-500">Asistencia:</span>
                    <span className={`font-bold ${alert.student.asistencia < 70 ? 'text-amber-400' : 'text-slate-300'}`}>
                      {alert.student.asistencia}%
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-2 pt-3 border-t border-slate-700/30">
                  <button 
                    onClick={() => {
                      actions.toggleNotifications();
                      // Assuming selecting a course goes to SectionPage, we can do that or we can implement a KPI list view.
                      // Ideally we'd open a student modal here. For now, navigate to their course section.
                      const course = courses.find(c => c.id === alert.student.cursoId);
                      if (course) {
                        actions.selectCourse(course);
                      }
                    }}
                    className="flex-1 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    Ver detalle <ChevronRight size={14} />
                  </button>
                  <button 
                    onClick={() => {
                      actions.markIntervened(alert.student.codigo);
                    }}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg border border-slate-700/50 transition-colors"
                  >
                    Intervenir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
