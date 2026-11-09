import type { VercelRequest, VercelResponse } from '@vercel/node';
import { env, isRevealed } from './_lib/env';
import { json } from './_lib/http';

/** Heure du serveur + date de révélation : le compte à rebours du navigateur se cale dessus. */
export default function handler(_req: VercelRequest, res: VercelResponse) {
  json(res, 200, {
    now: new Date().toISOString(),
    revealAt: env.revealAt.toISOString(),
    revealed: isRevealed(),
  });
}
