import { useState } from 'react';
import { supabase } from '../supabaseClient';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signIn = async (identifier, password) => {
    setLoading(true);
    setError(null);

    try {
      let email = identifier.trim();
      
      // If the identifier is a code (e.g. C13005), lowercase and append domain
      if (!email.includes('@')) {
        email = `${email.toLowerCase()}@utp.edu.pe`;
      } else {
        email = email.toLowerCase();
      }

      // Strict security filter: validate institutional domain
      if (!email.endsWith('@utp.edu.pe')) {
        throw new Error('Acceso denegado: Solo el dominio institucional "@utp.edu.pe" está autorizado.');
      }

      // Supabase Authenticate
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message || 'Credenciales incorrectas.');
      }

      const user = authData.user;

      // Query teacher profile details
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.warn('Advertencia al consultar perfil:', profileError.message);
      }

      // Robust fallback if profile table is empty or lacks record
      const teacherProfile = profile || {
        codigo: email.split('@')[0].toUpperCase(),
        nombre: user.user_metadata?.nombre || 'Dr. Docente UTP',
        email: email,
        cargo: 'Docente Titular',
        departamento: 'Ing. de Sistemas',
        avatar: null
      };

      setLoading(false);
      return { user, profile: teacherProfile };
    } catch (err) {
      setError(err.message || 'Ocurrió un error inesperado al iniciar sesión.');
      setLoading(false);
      throw err;
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
    setLoading(false);
  };

  return { signIn, signOut, loading, error };
}
