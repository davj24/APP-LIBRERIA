import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn(
    'ATTENZIONE: Variabili d\'ambiente Supabase non configurate in .env.local. Inserisci VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY validi.'
  );
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Mancano le variabili d\'ambiente Supabase: imposta VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nel file .env.local'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
