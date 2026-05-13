import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  || import.meta.env.VITE_SUPABASE_URL?.trim()
  || '';
const supabaseAnonKey = import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
  || import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
  || '';

const createFallbackClient = (): SupabaseClient => {
  const missingConfigError = new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.');

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({
        data: {
          subscription: {
            unsubscribe: () => undefined,
          },
        },
      } as any),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: missingConfigError as any }),
      signUp: async () => ({ data: { user: null, session: null }, error: missingConfigError as any }),
      signInWithOtp: async () => ({ data: { user: null, session: null }, error: missingConfigError as any }),
      signOut: async () => ({ data: null, error: missingConfigError as any }),
      resetPasswordForEmail: async () => ({ data: null, error: missingConfigError as any }),
      updateUser: async () => ({ data: { user: null }, error: missingConfigError as any }),
    } as any,
    from: () => {
      throw missingConfigError;
    },
  } as unknown as SupabaseClient;
};

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createFallbackClient();

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== '' && supabaseAnonKey !== '';
};
