/**
 * Envoie le dossier private-media/mon-amour dans le bucket Supabase PRIVÉ « mon-amour ».
 *
 * Usage (PowerShell) :
 *   $env:SUPABASE_URL="https://xxx.supabase.co"; $env:SUPABASE_SERVICE_ROLE_KEY="..."; npm run upload:private
 * Usage (bash) :
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run upload:private
 */
import { createClient } from '@supabase/supabase-js';
import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('❌ Définis SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
};

const dir = 'private-media/mon-amour';
const supabase = createClient(url, key, { auth: { persistSession: false } });

for (const name of await readdir(dir)) {
  const contentType = MIME[extname(name).toLowerCase()];
  if (!contentType) continue;
  const file = await readFile(join(dir, name));
  const { error } = await supabase.storage.from('mon-amour').upload(name, file, { contentType, upsert: true });
  console.log(error ? `❌ ${name} : ${error.message}` : `✅ ${name}`);
}
