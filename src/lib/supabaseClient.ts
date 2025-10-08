// Robust auth utilities with health + backoff for existing Supabase client
import { supabase } from '@/integrations/supabase/client';

// Lightweight live check (CORS/redirect/cert)
export async function assertSupabaseReachable(timeoutMs = 5000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const url = new URL('/auth/v1/health', 'https://yrndifsbsmpvmpudglcc.supabase.co');
    const r = await fetch(url.toString(), { signal: controller.signal, credentials: 'omit' });
    if (!r.ok) throw new Error(`Health ${r.status}`);
  } finally { 
    clearTimeout(t); 
  }
}

// Retry wrapper for sign-in/up actions
export async function withAuthBackoff<T>(fn: () => Promise<T>, label: string): Promise<T> {
  const max = 4;
  let delay = 200;
  for (let i = 0; i < max; i++) {
    try { 
      return await fn(); 
    } catch (e) {
      if (i === max - 1) throw e;
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
  throw new Error(`[auth] ${label} exhausted retries`);
}

// Re-export existing client
export { supabase };
