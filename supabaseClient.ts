
import { createClient } from '@supabase/supabase-js';

// Switched to process.env as import.meta.env was undefined in this environment
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Export the client if keys exist, otherwise null (triggers Local Mode in App.tsx)
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Kept as a no-op to prevent breaking imports
export const clearManualConfig = () => {
  console.log("Manual config cleared locally.");
};
