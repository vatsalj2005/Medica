import { supabase } from './supabaseClient';
import bcrypt from 'bcryptjs';

export type UserRole = 'patient' | 'doctor' | 'receptionist';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthSession {
  role: UserRole;
  user: AuthUser;
}

export async function loginUser(
  email: string,
  password: string
): Promise<AuthSession | null> {
  // Try patient table first (lowercase table and column names)
  const { data: patientData, error: patientError } = await supabase
    .from('patient')
    .select('p_id, name, email, password')
    .eq('email', email)
    .single();

  if (patientData && !patientError) {
    const isValid = await bcrypt.compare(password, patientData.password);
    if (isValid) {
      return {
        role: 'patient',
        user: {
          id: patientData.p_id,
          name: patientData.name,
          email: patientData.email,
        },
      };
    }
  }

  // Try doctor table
  const { data: doctorData, error: doctorError } = await supabase
    .from('doctor')
    .select('d_id, name, email, password')
    .eq('email', email)
    .single();

  if (doctorData && !doctorError) {
    const isValid = await bcrypt.compare(password, doctorData.password);
    if (isValid) {
      return {
        role: 'doctor',
        user: {
          id: doctorData.d_id,
          name: doctorData.name,
          email: doctorData.email,
        },
      };
    }
  }

  // Try receptionist table
  const { data: receptionistData, error: receptionistError } = await supabase
    .from('receptionist')
    .select('r_id, name, email, password')
    .eq('email', email)
    .single();

  if (receptionistData && !receptionistError) {
    const isValid = await bcrypt.compare(password, receptionistData.password);
    if (isValid) {
      return {
        role: 'receptionist',
        user: {
          id: receptionistData.r_id,
          name: receptionistData.name,
          email: receptionistData.email,
        },
      };
    }
  }

  return null;
}

export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  
  const sessionData = localStorage.getItem('mediapp_session');
  if (!sessionData) return null;

  try {
    return JSON.parse(sessionData) as AuthSession;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('mediapp_session');
}
