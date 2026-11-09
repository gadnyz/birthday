import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAuthorized } from '../_lib/auth';
import { env } from '../_lib/env';
import { json, methodNotAllowed } from '../_lib/http';
import { monAmourContent } from '../_lib/mon-amour-content';

/**
 * Dossier des photos de /mon-amour (public/img/<dossier>).
 * Son nom aléatoire n'est connu que du serveur : il n'est donné qu'après le bon code.
 */
const MEDIA_DIR = '/img/ma-a34025caec0d6047';

/** Contenu privé de /mon-amour : servi uniquement avec un jeton valide. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  if (!isAuthorized(req, 'mon-amour')) return json(res, 401, { error: 'locked' });

  const c = monAmourContent;
  return json(res, 200, {
    ...c,
    youtubeId: env.youtubeId || c.youtubeId,
    photos: c.photos.map((p) => ({ ...p, url: `${MEDIA_DIR}/${p.path}` })),
    video: { ...c.video, url: `${MEDIA_DIR}/${c.video.path}` },
  });
}
