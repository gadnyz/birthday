import type { VercelRequest, VercelResponse } from '@vercel/node';
import { COOKIE, createToken, isAuthorized, safeEqual, setCookie } from '../_lib/auth';
import { env, isRevealed } from '../_lib/env';
import { body, json, methodNotAllowed, sleep, str } from '../_lib/http';
import { BUCKET_SOUVENIRS, db, signPaths } from '../_lib/supabase';

const TTL = 60 * 60 * 12;

/**
 * GET  : liste complète (y compris messages masqués) + statistiques, pour l'organisateur.
 * POST : { action: 'login', password } | { action: 'logout' }
 *        | { action: 'hide' | 'show' | 'delete', id }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') return await list(req, res);
    if (req.method === 'POST') return await act(req, res);
    return methodNotAllowed(res, ['GET', 'POST']);
  } catch (e) {
    console.error(e);
    return json(res, 500, { error: 'server_error' });
  }
}

async function list(req: VercelRequest, res: VercelResponse) {
  if (!isAuthorized(req, 'admin')) return json(res, 401, { error: 'unauthorized' });

  const { data, error } = await db()
    .from('messages')
    .select('id, author_name, relation, lang, body, photo_path, video_path, hearts, hidden, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;

  const rows = data ?? [];
  const urls = await signPaths(
    BUCKET_SOUVENIRS,
    rows.flatMap((m) => [m.photo_path, m.video_path]).filter(Boolean) as string[],
    3600,
  );

  return json(res, 200, {
    revealed: isRevealed(),
    revealAt: env.revealAt.toISOString(),
    stats: {
      total: rows.length,
      visible: rows.filter((m) => !m.hidden).length,
      photos: rows.filter((m) => m.photo_path).length,
      videos: rows.filter((m) => m.video_path).length,
    },
    messages: rows.map((m) => ({
      ...m,
      photo_url: m.photo_path ? (urls[m.photo_path] ?? null) : null,
      video_url: m.video_path ? (urls[m.video_path] ?? null) : null,
    })),
  });
}

async function act(req: VercelRequest, res: VercelResponse) {
  const b = body(req);
  const action = str(b['action'], 20);

  if (action === 'login') {
    if (!env.adminPassword || !env.jwtSecret) return json(res, 503, { error: 'not_configured' });
    await sleep(600);
    if (!safeEqual(str(b['password'], 200), env.adminPassword)) return json(res, 401, { error: 'bad_password' });
    setCookie(res, COOKIE.admin, createToken('admin', TTL), TTL);
    return json(res, 200, { ok: true });
  }

  if (action === 'logout') {
    setCookie(res, COOKIE.admin, '', 0);
    return json(res, 200, { ok: true });
  }

  if (!isAuthorized(req, 'admin')) return json(res, 401, { error: 'unauthorized' });

  const id = str(b['id'], 40);
  if (!/^[0-9a-f-]{36}$/.test(id)) return json(res, 400, { error: 'bad_id' });

  if (action === 'hide' || action === 'show') {
    const { error } = await db().from('messages').update({ hidden: action === 'hide' }).eq('id', id);
    if (error) throw error;
    return json(res, 200, { ok: true });
  }

  if (action === 'delete') {
    const { data } = await db().from('messages').select('photo_path, video_path').eq('id', id).single();
    const files = [data?.photo_path, data?.video_path].filter(Boolean) as string[];
    if (files.length) await db().storage.from(BUCKET_SOUVENIRS).remove(files);
    const { error } = await db().from('messages').delete().eq('id', id);
    if (error) throw error;
    return json(res, 200, { ok: true });
  }

  return json(res, 400, { error: 'bad_action' });
}
