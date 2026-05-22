import { useState, useCallback } from 'react';
import { analyzeStudentRetention, sendInterventionEmail } from '../services/aiService';

/**
 * Hook personalizado para integrar el módulo de IA VIGÍA de forma limpia en componentes de React.
 * Maneja automáticamente los estados de carga (loading), error y almacenamiento del resultado.
 */
export function useStudentAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  /**
     * Ejecuta el análisis de retención del estudiante.
     * @param {Object} student - Información completa del estudiante.
     */
  const analyze = useCallback(async (student) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeStudentRetention(student);
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message || 'Ocurrió un error inesperado al analizar con IA.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
     * Envía (y registra) el correo electrónico generado.
     * @param {Object} student - Información completa del estudiante.
     * @param {string} subject - Asunto del correo.
     * @param {string} body - Cuerpo del correo.
     */
  const sendEmail = useCallback(async (student, subject, body) => {
    setLoading(true);
    setError(null);

    try {
      const success = await sendInterventionEmail(student, subject, body);
      return success;
    } catch (err) {
      setError(err.message || 'Error al intentar enviar el correo de intervención.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    analyze,
    sendEmail,
    loading,
    error,
    result,
    setResult
  };
}
