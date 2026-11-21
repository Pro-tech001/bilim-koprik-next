import { createBrowserClient } from '@supabase/ssr';

let client;

// Brauzer uchun yagona Supabase klienti (sessiya cookie'da saqlanadi — proxy ham ko'radi).
export function getSupabase() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );
  }
  return client;
}
