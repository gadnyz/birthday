import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAuthorized } from '../_lib/auth';
import { env } from '../_lib/env';
import { json, methodNotAllowed } from '../_lib/http';
import { monAmourContent } from '../_lib/mon-amour-content';
import { BUCKET_MON_AMOUR, signPaths } from '../_lib/supabase';

/** Contenu privé de /mon-amour : servi uniquement avec un jeton valide. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  if (!isAuthorized(req, 'mon-amour')) return json(res, 401, { error: 'locked' });

  try {
    const c = monAmourContent;
    const urls = await signPaths(
      BUCKET_MON_AMOUR,
      [...c.photos.map((p) => p.path), c.video.path, ...c.timeline.map((t) => t.photo ?? '')],
      2 * 3600,
    );

    return json(res, 200, {
      ...c,
      youtubeId: env.youtubeId || c.youtubeId,
      photos: c.photos.map((p) => ({ ...p, url: urls[p.path] ?? null })),
      video: { ...c.video, url: urls[c.video.path] ?? null },
      timeline: c.timeline.map((t) => ({ ...t, photoUrl: t.photo ? (urls[t.photo] ?? null) : null })),
    });
  } catch (e) {
    console.error(e);
    return json(res, 500, { error: 'server_error' });
  }
}
