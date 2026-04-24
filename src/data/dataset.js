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

// Dataset de 30 estudiantes
const rawStudents = [
  // Ciclo U21 - Veteranos en riesgo
  { codigo: 'U21317697', nombre: 'Valentina Quispe Rojas',       carrera: 'Ingeniería de Sistemas', ciclo: '6to', PC1: 10, PC2: 9,  PC3: 7,  PC4: null, asistencia: 48, actividadDias: 25 },
  { codigo: 'U21204831', nombre: 'Andrés Mamani Condori',        carrera: 'Administración',         ciclo: '6to', PC1: 11, PC2: 8,  PC3: 6,  PC4: null, asistencia: 52, actividadDias: 22 },
  { codigo: 'U21389045', nombre: 'Sofía Huanca Pilco',           carrera: 'Contabilidad',           ciclo: '6to', PC1: 9,  PC2: 7,  PC3: 5,  PC4: null, asistencia: 41, actividadDias: 30 },
  { codigo: 'U21156782', nombre: 'Diego Torres Alvarez',         carrera: 'Ingeniería de Sistemas', ciclo: '6to', PC1: 13, PC2: 14, PC3: 12, PC4: null, asistencia: 88, actividadDias: 2  },
  { codigo: 'U21423901', nombre: 'Camila Salazar Flores',        carrera: 'Derecho',                ciclo: '6to', PC1: 15, PC2: 14, PC3: 16, PC4: null, asistencia: 95, actividadDias: 1  },
  { codigo: 'U21078234', nombre: 'Rodrigo Vargas Medina',        carrera: 'Ingeniería Civil',       ciclo: '6to', PC1: 10, PC2: 11, PC3: 9,  PC4: null, asistencia: 70, actividadDias: 10 },
  { codigo: 'U21340128', nombre: 'Luciana Paz Mendoza',          carrera: 'Psicología',             ciclo: '6to', PC1: 12, PC2: 11, PC3: 10, PC4: null, asistencia: 73, actividadDias: 8  },
  { codigo: 'U21512366', nombre: 'Sebastián Chávez Ramos',       carrera: 'Administración',         ciclo: '6to', PC1: 6,  PC2: 5,  PC3: 4,  PC4: null, asistencia: 35, actividadDias: 35 },
  { codigo: 'U21290473', nombre: 'Isabella Morales Cabrera',     carrera: 'Marketing',              ciclo: '6to', PC1: 16, PC2: 17, PC3: 15, PC4: null, asistencia: 98, actividadDias: 1  },
  { codigo: 'U21631847', nombre: 'Emiliano Cáceres Paredes',     carrera: 'Ingeniería de Sistemas', ciclo: '6to', PC1: 11, PC2: 12, PC3: 10, PC4: null, asistencia: 75, actividadDias: 7  },

  // Ciclo U22 - Intermedios
  { codigo: 'U22113456', nombre: 'Daniela Romero Sánchez',       carrera: 'Contabilidad',           ciclo: '4to', PC1: 13, PC2: 12, PC3: 11, PC4: null, asistencia: 80, actividadDias: 4  },
  { codigo: 'U22285901', nombre: 'Matías Herrera Gutiérrez',     carrera: 'Derecho',                ciclo: '4to', PC1: 9,  PC2: 10, PC3: 8,  PC4: null, asistencia: 65, actividadDias: 12 },
  { codigo: 'U22374120', nombre: 'Valeria Reyes Castillo',       carrera: 'Administración',         ciclo: '4to', PC1: 14, PC2: 13, PC3: 15, PC4: null, asistencia: 91, actividadDias: 2  },
  { codigo: 'U22049237', nombre: 'Nicolás Peña Villanueva',      carrera: 'Ingeniería Civil',       ciclo: '4to', PC1: 7,  PC2: 6,  PC3: 8,  PC4: null, asistencia: 55, actividadDias: 20 },
  { codigo: 'U22567083', nombre: 'Natalia Cruz López',           carrera: 'Psicología',             ciclo: '4to', PC1: 12, PC2: 13, PC3: 12, PC4: null, asistencia: 83, actividadDias: 3  },
  { codigo: 'U22198345', nombre: 'Tomás Vega Espinoza',          carrera: 'Marketing',              ciclo: '4to', PC1: 10, PC2: 9,  PC3: 7,  PC4: null, asistencia: 68, actividadDias: 13 },
  { codigo: 'U22411672', nombre: 'Renata Acosta Mendívil',       carrera: 'Ingeniería de Sistemas', ciclo: '4to', PC1: 16, PC2: 18, PC3: 17, PC4: null, asistencia: 97, actividadDias: 1  },
  { codigo: 'U22073891', nombre: 'Felipe Aguilar Toro',          carrera: 'Contabilidad',           ciclo: '4to', PC1: 8,  PC2: 7,  PC3: 5,  PC4: null, asistencia: 45, actividadDias: 28 },
  { codigo: 'U22336524', nombre: 'Ariana Delgado Quispe',        carrera: 'Derecho',                ciclo: '4to', PC1: 11, PC2: 10, PC3: 12, PC4: null, asistencia: 77, actividadDias: 6  },
  { codigo: 'U22490156', nombre: 'Santiago Montoya Fuentes',     carrera: 'Ingeniería Civil',       ciclo: '4to', PC1: 5,  PC2: 4,  PC3: 6,  PC4: null, asistencia: 30, actividadDias: 40 },

  // Ciclo U23 - Nuevos ingresos
  { codigo: 'U23101234', nombre: 'Mariana Ríos Fernández',       carrera: 'Administración',         ciclo: '2do', PC1: 13, PC2: 14, PC3: 13, PC4: null, asistencia: 86, actividadDias: 3  },
  { codigo: 'U23245678', nombre: 'Alejandro Fuentes Vera',       carrera: 'Psicología',             ciclo: '2do', PC1: 10, PC2: 9,  PC3: 8,  PC4: null, asistencia: 62, actividadDias: 15 },
  { codigo: 'U23389012', nombre: 'Gabriela Ochoa Tapia',         carrera: 'Marketing',              ciclo: '2do', PC1: 15, PC2: 16, PC3: 14, PC4: null, asistencia: 93, actividadDias: 2  },
  { codigo: 'U23423456', nombre: 'Joaquín Silva Bravo',          carrera: 'Ingeniería de Sistemas', ciclo: '2do', PC1: 7,  PC2: 6,  PC3: 5,  PC4: null, asistencia: 50, actividadDias: 25 },
  { codigo: 'U23567890', nombre: 'Catalina Torres Noriega',      carrera: 'Contabilidad',           ciclo: '2do', PC1: 12, PC2: 11, PC3: 13, PC4: null, asistencia: 79, actividadDias: 5  },
  { codigo: 'U23612345', nombre: 'Maximiliano Lagos Porras',     carrera: 'Ingeniería Civil',       ciclo: '2do', PC1: 9,  PC2: 8,  PC3: 7,  PC4: null, asistencia: 58, actividadDias: 18 },
  { codigo: 'U23756789', nombre: 'Fernanda Castillo Rueda',      carrera: 'Derecho',                ciclo: '2do', PC1: 14, PC2: 15, PC3: 13, PC4: null, asistencia: 90, actividadDias: 2  },
  { codigo: 'U23801234', nombre: 'Ignacio Paredes Salas',        carrera: 'Administración',         ciclo: '2do', PC1: 6,  PC2: 5,  PC3: 4,  PC4: null, asistencia: 38, actividadDias: 33 },
  { codigo: 'U23945678', nombre: 'Valentina Guzmán Prada',       carrera: 'Psicología',             ciclo: '2do', PC1: 11, PC2: 12, PC3: 10, PC4: null, asistencia: 74, actividadDias: 7  },
  { codigo: 'U23090123', nombre: 'Bruno Espinoza Quiroga',       carrera: 'Marketing',              ciclo: '2do', PC1: 17, PC2: 18, PC3: 16, PC4: null, asistencia: 99, actividadDias: 1  },
];

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
    cursoId: ['SIST101', 'SIST102', 'SIST103'][Math.floor(Math.random() * 3)],
    intervenido: false,
  };
});

// Cursos del docente
export const COURSES_INITIAL = [
  {
    id: 'SIST101',
    nombre: 'Algoritmos y Estructuras de Datos',
    codigo: 'SIST101',
    seccion: 'G01',
    ciclo: '2026-I',
    horario: 'Lun/Mié 08:00-10:00',
    aula: 'H-201',
    alumnos: 30,
    creditos: 4,
  },
  {
    id: 'SIST102',
    nombre: 'Ingeniería de Software I',
    codigo: 'SIST102',
    seccion: 'G02',
    ciclo: '2026-I',
    horario: 'Mar/Jue 10:00-12:00',
    aula: 'H-305',
    alumnos: 28,
    creditos: 3,
  },
  {
    id: 'SIST103',
    nombre: 'Base de Datos Avanzado',
    codigo: 'SIST103',
    seccion: 'G01',
    ciclo: '2026-I',
    horario: 'Vie 14:00-18:00',
    aula: 'Lab-102',
    alumnos: 25,
    creditos: 4,
  },
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
