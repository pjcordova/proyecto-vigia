// ============================================================
// VIGÍA - Dataset de prueba: 30 estudiantes con datos variados
// Motor de cálculo académico UTP
// ============================================================

// Pesos de evaluación UTP
export const WEIGHTS = { PC1: 0.20, PC2: 0.20, PC3: 0.20, PC4: 0.40 };
export const MIN_APPROVAL = 12;
export const ROUND_THRESHOLD = 11.45;

// Calcula promedio ponderado
export function calcPromedio(grades) {
  const { PC1, PC2, PC3, PC4 } = grades;
  return PC1 * WEIGHTS.PC1 + PC2 * WEIGHTS.PC2 + PC3 * WEIGHTS.PC3 + PC4 * WEIGHTS.PC4;
}

// Nota visual (aplica redondeo si >= 11.45)
export function notaVisual(promedio) {
  if (promedio >= ROUND_THRESHOLD && promedio < MIN_APPROVAL) return MIN_APPROVAL;
  return Math.round(promedio * 100) / 100;
}

// Proyecta qué nota necesita en PC4 para alcanzar 11.5 acumulado
export function notaNecesariaPC4(grades) {
  const { PC1, PC2, PC3 } = grades;
  const parcial = PC1 * WEIGHTS.PC1 + PC2 * WEIGHTS.PC2 + PC3 * WEIGHTS.PC3;
  // 11.5 = parcial + PC4 * 0.40 => PC4 = (11.5 - parcial) / 0.40
  const needed = (11.5 - parcial) / 0.40;
  if (needed <= 0) return 0;
  if (needed > 20) return null; // Matemáticamente imposible
  return Math.ceil(needed * 100) / 100;
}

// Determina estado de riesgo
export function calcRiesgo(promedio, asistencia, actividadDias) {
  if (promedio < 8 || asistencia < 50 || actividadDias > 21) return 'CRITICO';
  if (promedio < 10 || asistencia < 65 || actividadDias > 14) return 'ALTO';
  if (promedio < 12 || asistencia < 75) return 'MEDIO';
  return 'BAJO';
}

// Génera historial de actividad mensual
function genActividad(base) {
  return [
    { mes: 'Feb', accesos: base + Math.floor(Math.random() * 10) },
    { mes: 'Mar', accesos: base - Math.floor(Math.random() * 8) },
    { mes: 'Abr', accesos: base - Math.floor(Math.random() * 15) },
    { mes: 'May', accesos: Math.max(0, base - Math.floor(Math.random() * 20)) },
  ];
}

// Generación dinámica de estudiantes para balancear datos realistas
const firstNames = ['Valentina', 'Andrés', 'Sofía', 'Diego', 'Camila', 'Rodrigo', 'Luciana', 'Sebastián', 'Isabella', 'Emiliano', 'Daniela', 'Matías', 'Valeria', 'Nicolás', 'Natalia', 'Tomás', 'Renata', 'Felipe', 'Ariana', 'Santiago', 'Mariana', 'Alejandro', 'Gabriela', 'Joaquín', 'Catalina', 'Maximiliano', 'Fernanda', 'Ignacio', 'Bruno', 'Ximena', 'Mateo', 'Emma', 'Lucas', 'Martina', 'Leonardo', 'Mia', 'Hugo', 'Zoe', 'Martín', 'Alma'];
const lastNames = ['Quispe', 'Rojas', 'Mamani', 'Condori', 'Huanca', 'Pilco', 'Torres', 'Alvarez', 'Salazar', 'Flores', 'Vargas', 'Medina', 'Paz', 'Mendoza', 'Chávez', 'Ramos', 'Morales', 'Cabrera', 'Cáceres', 'Paredes', 'Romero', 'Sánchez', 'Herrera', 'Gutiérrez', 'Reyes', 'Castillo', 'Peña', 'Villanueva', 'Cruz', 'López', 'Vega', 'Espinoza', 'Acosta', 'Mendívil', 'Aguilar', 'Toro', 'Delgado', 'Montoya', 'Fuentes', 'Ríos'];
const careers = ['Ingeniería de Sistemas', 'Administración', 'Contabilidad', 'Derecho', 'Ingeniería Civil', 'Psicología', 'Marketing'];

function generateStudent(courseId, profile) {
  const code = 'U' + (20 + Math.floor(Math.random() * 4)) + Math.floor(100000 + Math.random() * 900000);
  const nombre = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  const carrera = careers[Math.floor(Math.random() * careers.length)];
  const ciclo = ['2do', '4to', '6to', '8vo'][Math.floor(Math.random() * 4)];
  
  let PC1, PC2, PC3, asistencia, actividadDias;
  if (profile === 'good') {
    PC1 = 14 + Math.floor(Math.random() * 7);
    PC2 = 14 + Math.floor(Math.random() * 7);
    PC3 = 14 + Math.floor(Math.random() * 7);
    asistencia = 85 + Math.floor(Math.random() * 16);
    actividadDias = 1 + Math.floor(Math.random() * 4);
  } else if (profile === 'average') {
    PC1 = 11 + Math.floor(Math.random() * 4);
    PC2 = 11 + Math.floor(Math.random() * 4);
    PC3 = 11 + Math.floor(Math.random() * 4);
    asistencia = 75 + Math.floor(Math.random() * 11);
    actividadDias = 3 + Math.floor(Math.random() * 5);
  } else if (profile === 'risk_attendance') {
    PC1 = 12 + Math.floor(Math.random() * 6);
    PC2 = 12 + Math.floor(Math.random() * 6);
    PC3 = 12 + Math.floor(Math.random() * 6);
    asistencia = 50 + Math.floor(Math.random() * 15);
    actividadDias = 5 + Math.floor(Math.random() * 8);
  } else if (profile === 'risk_grades') {
    PC1 = 5 + Math.floor(Math.random() * 5);
    PC2 = 5 + Math.floor(Math.random() * 5);
    PC3 = 5 + Math.floor(Math.random() * 5);
    asistencia = 70 + Math.floor(Math.random() * 20);
    actividadDias = 5 + Math.floor(Math.random() * 10);
  } else { // critical_abandonment
    PC1 = 0 + Math.floor(Math.random() * 6);
    PC2 = 0 + Math.floor(Math.random() * 6);
    PC3 = 0 + Math.floor(Math.random() * 6);
    asistencia = 20 + Math.floor(Math.random() * 30);
    actividadDias = 15 + Math.floor(Math.random() * 20);
  }

  return { codigo: code, nombre, carrera, ciclo, PC1, PC2, PC3, PC4: null, asistencia, actividadDias, cursoId: courseId };
}

const courseProfiles = [
  { id: 'SIST101', counts: { good: 10, average: 15, risk_attendance: 2, risk_grades: 4, critical_abandonment: 1 } },
  { id: 'SIST102', counts: { good: 5, average: 10, risk_attendance: 1, risk_grades: 12, critical_abandonment: 2 } },
  { id: 'SIST103', counts: { good: 15, average: 8, risk_attendance: 0, risk_grades: 2, critical_abandonment: 0 } },
  { id: 'SIST104', counts: { good: 8, average: 12, risk_attendance: 5, risk_grades: 8, critical_abandonment: 3 } },
  { id: 'SIST105', counts: { good: 12, average: 10, risk_attendance: 3, risk_grades: 3, critical_abandonment: 1 } },
  { id: 'SIST106', counts: { good: 9, average: 11, risk_attendance: 2, risk_grades: 5, critical_abandonment: 2 } },
  { id: 'SIST107', counts: { good: 14, average: 7, risk_attendance: 4, risk_grades: 1, critical_abandonment: 0 } },
  { id: 'SIST108', counts: { good: 6, average: 8, risk_attendance: 5, risk_grades: 6, critical_abandonment: 5 } },
  { id: 'SIST109', counts: { good: 11, average: 14, risk_attendance: 1, risk_grades: 3, critical_abandonment: 1 } },
];

const rawStudents = [];
courseProfiles.forEach(cp => {
  Object.keys(cp.counts).forEach(profile => {
    for (let i = 0; i < cp.counts[profile]; i++) {
      rawStudents.push(generateStudent(cp.id, profile));
    }
  });
});

// Procesa y enriquece los datos
export const STUDENTS_INITIAL = rawStudents.map(s => {
  const grades = { PC1: s.PC1, PC2: s.PC2, PC3: s.PC3, PC4: s.PC4 ?? 0 };
  const promedio = calcPromedio({ ...grades, PC4: grades.PC4 });
  const riesgo = calcRiesgo(promedio, s.asistencia, s.actividadDias);
  return {
    ...s,
    grades,
    promedio,
    notaFinal: notaVisual(promedio),
    riesgo,
    necesitaPC4: notaNecesariaPC4({ PC1: s.PC1, PC2: s.PC2, PC3: s.PC3 }),
    actividadMensual: genActividad(Math.floor(30 - s.actividadDias * 0.8)),
    email: `${s.codigo.toLowerCase()}@utp.edu.pe`,
    foto: null,
    intervenido: false,
  };
});

// Cursos del docente
export const COURSES_INITIAL = [
  { id: 'SIST101', nombre: 'Algoritmos y Estructuras de Datos', codigo: 'SIST101', seccion: 'G01', ciclo: '2026-I', horario: 'Lun/Mié 08:00-10:00', aula: 'H-201', alumnos: 32, creditos: 4 },
  { id: 'SIST102', nombre: 'Ingeniería de Software I', codigo: 'SIST102', seccion: 'G02', ciclo: '2026-I', horario: 'Mar/Jue 10:00-12:00', aula: 'H-305', alumnos: 30, creditos: 3 },
  { id: 'SIST103', nombre: 'Base de Datos Avanzado', codigo: 'SIST103', seccion: 'G01', ciclo: '2026-I', horario: 'Vie 14:00-18:00', aula: 'Lab-102', alumnos: 25, creditos: 4 },
  { id: 'SIST104', nombre: 'Curso Integrador II: Sistemas', codigo: 'SIST104', seccion: 'G03', ciclo: '2026-I', horario: 'Lun 18:00-22:00', aula: 'Lab-205', alumnos: 36, creditos: 4 },
  { id: 'SIST105', nombre: 'Interacción Hombre-Máquina', codigo: 'SIST105', seccion: 'G01', ciclo: '2026-I', horario: 'Mié/Vie 10:00-12:00', aula: 'H-402', alumnos: 29, creditos: 3 },
  { id: 'SIST106', nombre: 'Herramientas del Prototipo', codigo: 'SIST106', seccion: 'G02', ciclo: '2026-I', horario: 'Mar 14:00-17:00', aula: 'Lab-301', alumnos: 29, creditos: 3 },
  { id: 'SIST107', nombre: 'Innovación y Transformación Digital', codigo: 'SIST107', seccion: 'G01', ciclo: '2026-I', horario: 'Jue 18:00-21:00', aula: 'H-501', alumnos: 26, creditos: 3 },
  { id: 'SIST108', nombre: 'Gestión del Servicio TI', codigo: 'SIST108', seccion: 'G01', ciclo: '2026-I', horario: 'Sab 08:00-11:00', aula: 'H-203', alumnos: 30, creditos: 3 },
  { id: 'SIST109', nombre: 'Hojas de Estilo en Cascada Avanzada', codigo: 'SIST109', seccion: 'G04', ciclo: '2026-I', horario: 'Lun/Mié 14:00-16:00', aula: 'Lab-105', alumnos: 30, creditos: 3 },
];

// Docente
export const TEACHER = {
  codigo: 'C13005',
  nombre: 'Dr. Carlos Mendoza Paredes',
  email: 'c13005@utp.edu.pe',
  cargo: 'Docente Titular',
  departamento: 'Ing. de Sistemas',
  avatar: null,
};
