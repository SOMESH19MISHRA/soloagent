import { createClient } from '@supabase/supabase-js';

// The app will now exclusively use keys from your .env file
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Export the client if keys exist, otherwise null (triggers Local Mode in App.tsx)
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Kept as a no-op to prevent breaking imports, though functionally removed from UI
export const clearManualConfig = () => {
  console.log("Manual config cleared locally.");
};
