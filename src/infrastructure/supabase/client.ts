import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('ATTENZIONE: VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY non definite nelle variabili d\'ambiente.');
}

const baseUrl = (supabaseUrl || '').replace(/\/rest\/v1\/?$/, '');

export const supabase = createClient(baseUrl, supabaseAnonKey || '');
