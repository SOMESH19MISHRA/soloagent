
import { createClient } from '@supabase/supabase-js';

const getSupabaseConfig = () => {
  // 1. Try Environment Variables
  let url = process.env.SUPABASE_URL;
  let key = process.env.SUPABASE_ANON_KEY;

  // 2. Fallback to LocalStorage (for manual setup via UI)
  if (!url || !key) {
    const saved = localStorage.getItem('SOLOAGENT_SUPABASE_CONFIG');
    if (saved) {
      const parsed = JSON.parse(saved);
      url = parsed.url;
      key = parsed.key;
    }
  }

  return { url, key };
};

const config = getSupabaseConfig();

export const supabase = (config.url && config.key) 
  ? createClient(config.url, config.key) 
  : null;

// Helper to manually save config and reload
export const saveManualConfig = (url: string, key: string) => {
  localStorage.setItem('SOLOAGENT_SUPABASE_CONFIG', JSON.stringify({ url, key }));
  window.location.reload();
};

export const clearManualConfig = () => {
  localStorage.removeItem('SOLOAGENT_SUPABASE_CONFIG');
  window.location.reload();
};
