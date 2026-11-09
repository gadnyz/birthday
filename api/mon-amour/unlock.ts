import type { VercelRequest, VercelResponse } from '@vercel/node';
import { COOKIE, createToken, isAuthorized, safeEqual, setCookie } from '../_lib/auth';
import { env } from '../_lib/env';
import { body, json, methodNotAllowed, sleep, str } from '../_lib/http';

const TTL = 60 * 60 * 24 * 60; // 60 jours

/**
 * GET  : indique si le navigateur possède déjà un jeton valide.
 * POST : vérifie le code secret et dépose un cookie httpOnly signé.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') return json(res, 200, { unlocked: isAuthorized(req, 'mon-amour') });
  if (req.method !== 'POST') return methodNotAllowed(res, ['GET', 'POST']);

  if (!env.monAmourCode || !env.jwtSecret) return json(res, 503, { error: 'not_configured' });

  // Ralentit les tentatives de force brute.
  await sleep(600);

  const code = str(body(req)['code'], 100).toLowerCase().replace(/\s+/g, '');
  const expected = env.monAmourCode.toLowerCase().replace(/\s+/g, '');
  if (!code || !safeEqual(code, expected)) return json(res, 401, { error: 'bad_code' });

  setCookie(res, COOKIE['mon-amour'], createToken('mon-amour', TTL), TTL);
  return json(res, 200, { unlocked: true });
}
