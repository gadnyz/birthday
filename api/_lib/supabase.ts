import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

let client: SupabaseClient | null = null;

/** Client Supabase avec la clé service_role : ne JAMAIS l'exposer au navigateur. */
export function db(): SupabaseClient {
  if (!env.supabaseUrl || !env.supabaseKey) {
    throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants');
  }
  client ??= createClient(env.supabaseUrl, env.supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

export const BUCKET_SOUVENIRS = 'souvenirs';
export const BUCKET_MON_AMOUR = 'mon-amour';

/** Signe un lot de chemins et renvoie une table chemin -> URL signée. */
export async function signPaths(bucket: string, paths: string[], seconds = 3600): Promise<Record<string, string>> {
  const unique = [...new Set(paths.filter(Boolean))];
  if (!unique.length) return {};
  const { data, error } = await db().storage.from(bucket).createSignedUrls(unique, seconds);
  if (error) throw error;
  const out: Record<string, string> = {};
  for (const item of data ?? []) {
    if (item.path && item.signedUrl) out[item.path] = item.signedUrl;
  }
  return out;
}
