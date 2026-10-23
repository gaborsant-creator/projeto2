import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://acmdppeszrmzgutudxiw.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjbWRwcGVzenJtemd1dHVkeGl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3MTAyMjcsImV4cCI6MjEwODI4NjIyN30.NUCej6QV7sz2ABKm4TjuEKQfXacz-MG6-NIQfy8YXi7A';

/**
 * Flag (por aba) que indica login "sem lembrar": a sessão do admin fica apenas
 * no sessionStorage e some ao fechar a aba/navegador.
 */
export const ADMIN_SESSION_ONLY_FLAG = 'cantinho_admin_session_only';

/**
 * Storage do Supabase Auth: guarda o token em localStorage (lembrar) ou
 * sessionStorage (não lembrar), conforme a escolha feita no login.
 */
const authStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    return window.sessionStorage.getItem(key) ?? window.localStorage.getItem(key);
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    if (window.sessionStorage.getItem(ADMIN_SESSION_ONLY_FLAG)) {
      window.sessionStorage.setItem(key, value);
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, value);
      window.sessionStorage.removeItem(key);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.removeItem(key);
    window.localStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: authStorage,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
