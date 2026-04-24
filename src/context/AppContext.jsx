import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { STUDENTS_INITIAL, COURSES_INITIAL, TEACHER, calcPromedio, notaVisual, calcRiesgo, notaNecesariaPC4 } from '../data/dataset.js';

// ============================================================
// Global Application State with useReducer
// ============================================================

const AppContext = createContext(null);

const initialState = {
  // Auth
  authState: 'login', // 'login' | 'recovery' | 'authenticated'
  currentUser: null,
  loginAttempts: 0,
  accountLocked: false,
  recoveryCode: null,
  recoveryEmail: null,

  // Navigation
  currentView: 'dashboard', // 'dashboard' | 'section' | 'admin'
  selectedCourse: null,

  // Data
  students: STUDENTS_INITIAL,
  courses: COURSES_INITIAL,
  teacher: TEACHER,

  // UI
  adminTab: 'students', // 'students' | 'courses' | 'grades'
};

function reducer(state, action) {
  switch (action.type) {

    // AUTH
    case 'LOGIN_ATTEMPT': {
      const { codigo, password } = action.payload;
      const isValidCode = /^C\d{5}$/.test(codigo);
      const isCorrectCredentials = isValidCode && codigo === 'C13005' && password === 'Utp2026#';

      if (isCorrectCredentials && !state.accountLocked) {
        return {
          ...state,
          authState: 'authenticated',
          currentUser: state.teacher,
          loginAttempts: 0,
        };
      }

      const newAttempts = state.loginAttempts + 1;
      const locked = newAttempts >= 3;

      return {
        ...state,
        loginAttempts: newAttempts,
        accountLocked: locked,
        loginError: !isValidCode
          ? 'Acceso denegado: Solo identificadores con prefijo "C" son permitidos.'
          : locked
          ? 'Cuenta bloqueada por seguridad. Active el flujo de recuperación.'
          : `Credenciales incorrectas. Intentos restantes: ${3 - newAttempts}`,
      };
    }

    case 'INITIATE_RECOVERY': {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      return {
        ...state,
        authState: 'recovery',
        recoveryCode: code,
        recoveryEmail: 'c13005@utp.edu.pe',
        loginError: null,
      };
    }

    case 'VERIFY_RECOVERY': {
      if (action.payload.code === state.recoveryCode) {
        return {
          ...state,
          authState: 'authenticated',
          currentUser: state.teacher,
          accountLocked: false,
          loginAttempts: 0,
          recoveryCode: null,
        };
      }
      return { ...state, recoveryError: 'Código inválido. Verifique su correo institucional.' };
    }

    case 'LOGOUT':
      return { ...initialState, students: state.students, courses: state.courses };

    case 'CLEAR_LOGIN_ERROR':
      return { ...state, loginError: null };

    // NAVIGATION
    case 'SELECT_COURSE':
      return { ...state, selectedCourse: action.payload, currentView: 'section' };

    case 'GO_DASHBOARD':
      return { ...state, currentView: 'dashboard', selectedCourse: null };

    case 'GO_ADMIN':
      return { ...state, currentView: 'admin' };

    case 'SET_ADMIN_TAB':
      return { ...state, adminTab: action.payload };

    // STUDENT CRUD
    case 'ADD_STUDENT': {
      const s = action.payload;
      const grades = { PC1: s.PC1 || 0, PC2: s.PC2 || 0, PC3: s.PC3 || 0, PC4: s.PC4 || 0 };
      const promedio = calcPromedio(grades);
      const riesgo = calcRiesgo(promedio, s.asistencia || 0, s.actividadDias || 0);
      const newStudent = {
        ...s,
        grades,
        promedio,
        notaFinal: notaVisual(promedio),
        riesgo,
        necesitaPC4: notaNecesariaPC4(grades),
        actividadMensual: [
          { mes: 'Feb', accesos: 20 }, { mes: 'Mar', accesos: 18 },
          { mes: 'Abr', accesos: 15 }, { mes: 'May', accesos: 10 },
        ],
        email: `${s.codigo.toLowerCase()}@utp.edu.pe`,
        intervenido: false,
      };
      return { ...state, students: [...state.students, newStudent] };
    }

    case 'UPDATE_STUDENT': {
      const updated = state.students.map(st => {
        if (st.codigo !== action.payload.codigo) return st;
        const grades = { ...st.grades, ...action.payload.changes };
        const promedio = calcPromedio(grades);
        const riesgo = calcRiesgo(promedio, st.asistencia, st.actividadDias);
        return {
          ...st,
          ...action.payload.changes,
          grades,
          promedio,
          notaFinal: notaVisual(promedio),
          riesgo,
          necesitaPC4: notaNecesariaPC4(grades),
        };
      });
      return { ...state, students: updated };
    }

    case 'DELETE_STUDENT':
      return { ...state, students: state.students.filter(s => s.codigo !== action.payload) };

    case 'MARK_INTERVENED':
      return {
        ...state,
        students: state.students.map(s =>
          s.codigo === action.payload ? { ...s, intervenido: true } : s
        ),
      };

    // COURSE CRUD
    case 'ADD_COURSE':
      return { ...state, courses: [...state.courses, action.payload] };

    case 'UPDATE_COURSE':
      return {
        ...state,
        courses: state.courses.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload.changes } : c
        ),
      };

    case 'DELETE_COURSE':
      return { ...state, courses: state.courses.filter(c => c.id !== action.payload) };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = {
    login: (codigo, password) => dispatch({ type: 'LOGIN_ATTEMPT', payload: { codigo, password } }),
    initiateRecovery: () => dispatch({ type: 'INITIATE_RECOVERY' }),
    verifyRecovery: (code) => dispatch({ type: 'VERIFY_RECOVERY', payload: { code } }),
    logout: () => dispatch({ type: 'LOGOUT' }),
    clearLoginError: () => dispatch({ type: 'CLEAR_LOGIN_ERROR' }),
    selectCourse: (course) => dispatch({ type: 'SELECT_COURSE', payload: course }),
    goDashboard: () => dispatch({ type: 'GO_DASHBOARD' }),
    goAdmin: () => dispatch({ type: 'GO_ADMIN' }),
    setAdminTab: (tab) => dispatch({ type: 'SET_ADMIN_TAB', payload: tab }),
    addStudent: (student) => dispatch({ type: 'ADD_STUDENT', payload: student }),
    updateStudent: (codigo, changes) => dispatch({ type: 'UPDATE_STUDENT', payload: { codigo, changes } }),
    deleteStudent: (codigo) => dispatch({ type: 'DELETE_STUDENT', payload: codigo }),
    markIntervened: (codigo) => dispatch({ type: 'MARK_INTERVENED', payload: codigo }),
    addCourse: (course) => dispatch({ type: 'ADD_COURSE', payload: course }),
    updateCourse: (id, changes) => dispatch({ type: 'UPDATE_COURSE', payload: { id, changes } }),
    deleteCourse: (id) => dispatch({ type: 'DELETE_COURSE', payload: id }),
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
