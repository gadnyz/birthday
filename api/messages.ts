import type { VercelRequest, VercelResponse } from '@vercel/node';
import { env, isRevealed } from './_lib/env';
import { body, ipHash, json, methodNotAllowed, str } from './_lib/http';
import { BUCKET_SOUVENIRS, db, signPaths } from './_lib/supabase';

const LANGS = ['fr', 'en', 'sw'];
const RELATIONS = ['famille', 'ami', 'collegue', 'voisin', 'eglise', 'autre'];
const MEDIA_PATH = /^(photo|video)\/[0-9a-f-]{36}\.(jpg|jpeg|png|webp|mp4|mov|webm|m4v)$/;
const MAX_PER_HOUR = 5;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') return await list(res);
    if (req.method === 'POST') return await create(req, res);
    return methodNotAllowed(res, ['GET', 'POST']);
  } catch (e) {
    console.error(e);
    return json(res, 500, { error: 'server_error' });
  }
}

/** GET : liste vide tant que la révélation n'a pas eu lieu (contrôle côté serveur, pas navigateur). */
async function list(res: VercelResponse) {
  const { count } = await db()
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('hidden', false);

  if (!isRevealed()) {
    return json(res, 200, {
      revealed: false,
      revealAt: env.revealAt.toISOString(),
      count: count ?? 0,
      messages: [],
    });
  }

  const { data, error } = await db()
    .from('messages')
    .select('id, author_name, relation, lang, body, photo_path, video_path, city, lat, lng, hearts, created_at')
    .eq('hidden', false)
    .order('created_at', { ascending: true });
  if (error) throw error;

  const rows = data ?? [];
  const urls = await signPaths(
    BUCKET_SOUVENIRS,
    rows.flatMap((m) => [m.photo_path, m.video_path]).filter(Boolean) as string[],
    6 * 3600,
  );

  const messages = rows.map(({ photo_path, video_path, ...m }) => ({
    ...m,
    photo_url: photo_path ? (urls[photo_path] ?? null) : null,
    video_url: video_path ? (urls[video_path] ?? null) : null,
  }));

  return json(res, 200, {
    revealed: true,
    revealAt: env.revealAt.toISOString(),
    count: messages.length,
    messages,
  });
}

/** POST : dépôt d'un message (avec chemins de médias déjà envoyés via /api/upload-url). */
async function create(req: VercelRequest, res: VercelResponse) {
  const b = body(req);

  // Champ piège : invisible pour un humain, rempli par les robots.
  if (str(b['website'], 200)) return json(res, 200, { ok: true });

  const author_name = str(b['author_name'], 80);
  const relationRaw = str(b['relation'], 20);
  const relation = RELATIONS.includes(relationRaw) ? relationRaw : 'autre';
  const langRaw = str(b['lang'], 2);
  const lang = LANGS.includes(langRaw) ? langRaw : 'fr';
  const text = str(b['body'], 2000);
  const city = str(b['city'], 80) || null;
  const photo_path = str(b['photo_path'], 120) || null;
  const video_path = str(b['video_path'], 120) || null;

  if (!author_name || (!text && !photo_path && !video_path)) {
    return json(res, 400, { error: 'missing_fields' });
  }
  if (photo_path && !(MEDIA_PATH.test(photo_path) && photo_path.startsWith('photo/'))) {
    return json(res, 400, { error: 'bad_media' });
  }
  if (video_path && !(MEDIA_PATH.test(video_path) && video_path.startsWith('video/'))) {
    return json(res, 400, { error: 'bad_media' });
  }

  // Limite d'envois par adresse IP sur la dernière heure.
  const ip_hash = ipHash(req);
  const since = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await db()
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ip_hash)
    .gte('created_at', since);
  if ((count ?? 0) >= MAX_PER_HOUR) return json(res, 429, { error: 'too_many' });

  const coords = city ? await geocode(city) : null;

  const { error } = await db().from('messages').insert({
    author_name,
    relation,
    lang,
    body: text,
    photo_path,
    video_path,
    city,
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    ip_hash,
  });
  if (error) throw error;

  return json(res, 201, { ok: true, revealed: isRevealed() });
}

/** Géocodage gratuit et sans clé (Open-Meteo) pour la carte « Ils pensent à toi depuis… ». */
async function geocode(city: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const name = (city.split(',')[0] ?? city).trim();
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2500);
    const r = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?count=1&language=fr&name=${encodeURIComponent(name)}`,
      { signal: ctrl.signal },
    );
    clearTimeout(timer);
    const data = (await r.json()) as { results?: { latitude: number; longitude: number }[] };
    const first = data.results?.[0];
    return first ? { lat: first.latitude, lng: first.longitude } : null;
  } catch {
    return null;
  }
}
