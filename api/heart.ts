import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isRevealed } from './_lib/env';
import { body, json, methodNotAllowed, str } from './_lib/http';
import { db } from './_lib/supabase';

/** Réaction « cœur » de Victorine sur un message (uniquement après la révélation). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  if (!isRevealed()) return json(res, 403, { error: 'not_revealed' });

  const id = str(body(req)['id'], 40);
  if (!/^[0-9a-f-]{36}$/.test(id)) return json(res, 400, { error: 'bad_id' });

  const { data, error } = await db().rpc('increment_hearts', { message_id: id });
  if (error) {
    console.error(error);
    return json(res, 500, { error: 'server_error' });
  }
  return json(res, 200, { hearts: data });
}
