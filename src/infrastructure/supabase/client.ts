import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ftxtrhwceaguwivdkexe.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_fkZA3HE1xU1lR2ixP4ntJg_H8Ugv1UN';

const baseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '');

export const supabase = createClient(baseUrl, supabaseAnonKey);
