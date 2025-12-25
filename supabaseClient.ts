
import { createClient } from '@supabase/supabase-js';

// Vite environment variables must be accessed via import.meta.env
// We use optional chaining and a cast to ensure compatibility in varied build environments
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

// Export the client if keys exist, otherwise null (triggers Local Mode in App.tsx)
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Kept as a no-op to prevent breaking imports
export const clearManualConfig = () => {
  console.log("Manual config cleared locally.");
};
