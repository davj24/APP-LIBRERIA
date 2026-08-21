import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variabili d\'ambiente Supabase mancanti! Assicurati di aver configurato VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nel file .env.local'
  );
}

// Normalizza l'URL nel caso in cui finisca con /rest/v1/
const baseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '');

export const supabase = createClient(baseUrl, supabaseAnonKey);
