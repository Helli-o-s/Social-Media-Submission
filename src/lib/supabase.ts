import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = 'https://szzddsnswwkcryuupgll.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  throw new Error('SUPABASE_KEY is not defined');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export type User = Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'];
