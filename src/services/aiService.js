/**
 * =========================================================================
 * VIGÍA - MÓDULO DE INTEGRACIÓN DE INTELIGENCIA ARTIFICIAL PARA RETENCIÓN ESTUDIANTIL
 * =========================================================================
 * 
 * Este módulo contiene toda la lógica de conexión con el modelo fundacional de IA 
 * (Google Gemini API) y la gestión del envío de correos de intervención personalizados.
 * 
 * Diseñado para producción: Limpio, tipado implícitamente, modular y tolerante a fallos.
 */

import { supabase } from '../supabaseClient';

// =========================================================================
// CONFIGURACIÓN DE API KEY (AISLADA)
// =========================================================================
// Opción A (Recomendada): Defina 'VITE_GEMINI_API_KEY' en su archivo '.env' en la raíz.
// Opción B: Reemplace la cadena de texto a continuación con su API Key directa de Google AI Studio.
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyCOisIJipWExk_xo0rPC0k9QYOdE1gtAiE";

// Modelo recomendado para velocidad, costo y excelente capacidad de seguimiento de JSON
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

/**
 * 1. FUNCIÓN DE ANÁLISIS PRINCIPAL
 * Realiza un análisis predictivo y genera un diagnóstico + correo empático utilizando la API de Gemini.
 * Obliga al modelo a responder estrictamente en formato JSON utilizando el motor de esquemas nativo.
 * 
 * @param {Object} studentData - Datos del alumno a evaluar.
 * @param {string} studentData.nombre - Nombre completo del alumno.
 * @param {string} studentData.codigo - Código único (Ej: C13005).
 * @param {string} studentData.email - Correo institucional del alumno.
 * @param {Object} studentData.grades - Desglose de notas (PC1, PC2, PC3, etc.).
 * @param {number} studentData.promedio - Promedio actual acumulado.
 * @param {number} studentData.asistencia - Porcentaje de asistencia actual (0-100).
 * @param {number} studentData.actividadDias - Días transcurridos desde su último acceso al campus.
 * @param {string} studentData.riesgo - Nivel de riesgo calculado (CRITICO, ALTO, MEDIO, BAJO).
 * @returns {Promise<Object>} Retorna un objeto JSON estructurado con 'comentario' y 'correo_personalizado'.
 */
export async function analyzeStudentRetention(studentData) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "REEMPLAZA_CON_TU_GEMINI_API_KEY") {
    console.error("VIGÍA AI Error: API Key no configurada.");
    throw new Error("La API Key de Gemini no está configurada. Por favor, añádala al inicio de 'src/services/aiService.js' o a su archivo .env.");
  }

  const { nombre, codigo, email, grades, promedio, asistencia, actividadDias, riesgo } = studentData;

  // Prompt altamente detallado y optimizado con técnicas de Few-Shot e instrucciones de rol.
  const prompt = `
Eres un Psicólogo Educativo Experto y Tutor Académico de la Universidad Tecnológica del Perú (UTP).
Tu misión es analizar la situación académica y de actividad digital del siguiente estudiante para prevenir su deserción universitaria (abandono de estudios).

DATOS DEL ESTUDIANTE A ANALIZAR:
- Nombre: ${nombre}
- Código: ${codigo}
- Correo: ${email}
- Notas actuales: PC1: ${grades?.PC1 ?? 'N/A'}, PC2: ${grades?.PC2 ?? 'N/A'}, PC3: ${grades?.PC3 ?? 'N/A'} (Nota aprobatoria mínima: 12)
- Promedio actual: ${promedio.toFixed(2)}
- Asistencia registrada: ${asistencia}%
- Días sin ingresar al campus virtual: ${actividadDias} días
- Nivel de riesgo asignado por el sistema: ${riesgo}

DIRECTRICES PARA EL ANÁLISIS:
1. Comentario o Diagnóstico (comentario):
   Analiza críticamente los datos. Si las notas son bajas, indica los temas en peligro. Si la asistencia es baja (especialmente menor a 70%), advierte el riesgo de inhabilitación por inasistencias. Si tiene muchos días sin acceder al campus virtual, diagnostica si es un caso de "abandono silencioso" o desinterés tecnológico. Sé directo, académico pero constructivo.

2. Propuesta de Correo Personalizado y Empático (correo_personalizado):
   Redacta un correo electrónico sumamente persuasivo, empático, cálido e institucional.
   - NO debe sonar robótico, amenazador ni puramente burocrático. Debe mostrar genuina preocupación por el bienestar del alumno.
   - Dirígete al alumno por su primer nombre de pila de forma natural.
   - Reconoce sus puntos débiles específicos (ej. "hemos notado que tu última nota en la PC3 bajó", o "vemos que hace ${actividadDias} días no ingresas a la plataforma").
   - Ofrécele soluciones claras: tutorías grupales gratuitas, asesoramiento psicológico de la universidad o reuniones de asesoría personal contigo.
   - Termina con una llamada a la acción motivadora.

RESPONDE ESTRICTAMENTE EN FORMATO JSON QUE CUMPLA CON EL ESQUEMA ESPECIFICADO.
`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3, // Temperatura baja para respuestas consistentes y profesionales
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
          // Usamos responseSchema para garantizar de forma estricta que la API devuelva la estructura requerida
          responseSchema: {
            type: "OBJECT",
            properties: {
              comentario: {
                type: "STRING",
                description: "Diagnóstico psicológico y educativo detallado y constructivo sobre la situación académica del alumno."
              },
              correo_personalizado: {
                type: "OBJECT",
                properties: {
                  asunto: {
                    type: "STRING",
                    description: "Asunto del correo institucional empático, corto y directo (máximo 7 palabras)."
                  },
                  cuerpo: {
                    type: "STRING",
                    description: "Cuerpo del correo personalizado con saludos, cuerpo empático detallando debilidades, alternativas de apoyo y firma del tutor."
                  }
                },
                required: ["asunto", "cuerpo"]
              }
            },
            required: ["comentario", "correo_personalizado"]
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API HTTP Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // Extraer la respuesta del formato del JSON devuelto por Gemini
    const rawTextResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawTextResponse) {
      throw new Error("No se recibió respuesta válida del modelo de IA.");
    }

    // Parsear el JSON generado de forma segura
    const aiResult = JSON.parse(rawTextResponse);
    return aiResult;

  } catch (error) {
    console.error("VIGÍA AI Integration Error:", error);
    throw error;
  }
}

/**
 * 2. ACCIÓN DE ENVÍO
 * Lógica lista para producción para registrar y enviar el correo de intervención.
 * En un entorno real, esta función realiza dos acciones:
 * 1. Registra la intervención en la base de datos (Supabase) para fines de auditoría y reportes de KPIs.
 * 2. Ejecuta el envío físico o abre el cliente de correo del usuario prellenado (Acción cliente-servidor).
 * 
 * @param {Object} student - Información del alumno.
 * @param {string} subject - Asunto del correo generado por la IA.
 * @param {string} body - Cuerpo del correo generado por la IA.
 * @returns {Promise<boolean>} Retorna true si la operación fue exitosa.
 */
export async function sendInterventionEmail(student, subject, body) {
  try {
    console.log(`[Intervención VIGÍA] Iniciando proceso de envío para: ${student.email}`);

    // --- PASO 1: Registro en Base de Datos para KPI y Reportes ---
    // Si la tabla de intervenciones está configurada, insertamos el registro de la auditoría.
    const { data, error } = await supabase
      .from('intervenciones')
      .insert([
        {
          student_id: student.codigo,
          student_email: student.email,
          student_name: student.nombre,
          fecha: new Date().toISOString(),
          asunto_enviado: subject,
          cuerpo_enviado: body,
          canal: 'EMAIL_IA',
          estado: 'ENVIADO',
          riesgo_momento: student.riesgo
        }
      ]);

    if (error) {
      // Advertencia no crítica: Si la tabla aún no existe en Supabase, logueamos para auditoría local.
      console.warn("VIGÍA DB Warning: No se pudo registrar en la base de datos. Verifique si existe la tabla 'intervenciones'.", error.message);
    } else {
      console.log("VIGÍA DB Success: Intervención registrada correctamente en Supabase.", data);
    }

    // --- PASO 2: Acción Física de Envío (Doble Flujo) ---
    // Flujo A: Enlace de correo directo (Mailto) como fallback instantáneo que siempre funciona de forma interactiva.
    const mailtoUrl = `mailto:${student.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Abrir cliente de correo nativo en una nueva pestaña/ventana
    window.open(mailtoUrl, '_blank');

    return true;
  } catch (error) {
    console.error("VIGÍA Email Sender Error:", error);
    throw error;
  }
}
