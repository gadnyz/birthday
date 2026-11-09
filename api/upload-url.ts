import { randomUUID } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { body, json, methodNotAllowed, str } from './_lib/http';
import { BUCKET_SOUVENIRS, db } from './_lib/supabase';

const MB = 1024 * 1024;
const TYPES: Record<string, { kind: 'photo' | 'video'; ext: string; max: number }> = {
  'image/jpeg': { kind: 'photo', ext: 'jpg', max: 8 * MB },
  'image/png': { kind: 'photo', ext: 'png', max: 8 * MB },
  'image/webp': { kind: 'photo', ext: 'webp', max: 8 * MB },
  'video/mp4': { kind: 'video', ext: 'mp4', max: 50 * MB },
  'video/quicktime': { kind: 'video', ext: 'mov', max: 50 * MB },
  'video/webm': { kind: 'video', ext: 'webm', max: 50 * MB },
  'video/x-m4v': { kind: 'video', ext: 'm4v', max: 50 * MB },
};

/**
 * Renvoie une URL d'envoi signée : le navigateur envoie le fichier directement à Supabase,
 * car les fonctions Vercel limitent le corps des requêtes à 4,5 Mo.
 * La taille maximale réelle est aussi imposée par la configuration du bucket (voir supabase/schema.sql).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  try {
    const b = body(req);
    const type = TYPES[str(b['contentType'], 40)];
    const size = Number(b['size'] ?? 0);
    if (!type) return json(res, 400, { error: 'bad_type' });
    if (!size || size > type.max) return json(res, 413, { error: 'too_large' });

    const path = `${type.kind}/${randomUUID()}.${type.ext}`;
    const { data, error } = await db().storage.from(BUCKET_SOUVENIRS).createSignedUploadUrl(path);
    if (error) throw error;
    return json(res, 200, { path, signedUrl: data.signedUrl });
  } catch (e) {
    console.error(e);
    return json(res, 500, { error: 'server_error' });
  }
}
